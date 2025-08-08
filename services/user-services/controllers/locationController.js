const Joi = require("joi");
const Location = require("../../../models/location");

const locationController = {
  // Create a new location
  createLocation: {
    validation: Joi.object({
      name: Joi.string().required().min(3),
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
    }),
    handler: async (req, res) => {
      try {
        const { name, latitude, longitude } = req.body;

        const locationExists = await Location.findOne({ where: { name, latitude, longitude } });
        if (locationExists) return res.status(400).json({ message: "Location already exists" });

        const location = await Location.create({ name, latitude, longitude });

        return res.status(201).json({ message: "Location created successfully", location });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
      }
    },
  },

  // Get all locations
  getLocations: {
    handler: async (req, res) => {
      try {
        const locations = await Location.findAll();
        return res.status(200).json({ locations });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
      }
    },
  },

  // Get a specific location by ID
  getLocationById: {
    validation: Joi.object({
      id: Joi.string().uuid().required(),
    }),
    handler: async (req, res) => {
      try {
        const { id } = req.params;

        const location = await Location.findByPk(id);
        if (!location) return res.status(404).json({ message: "Location not found" });

        return res.status(200).json({ location });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
      }
    },
  },

  // Update a location
  updateLocation: {
    validation: Joi.object({
      id: Joi.string().uuid().required(),
      name: Joi.string().required().min(3),
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
    }),
    handler: async (req, res) => {
      try {
        const { id, name, latitude, longitude } = req.body;

        const location = await Location.findByPk(id);
        if (!location) return res.status(404).json({ message: "Location not found" });

        location.name = name;
        location.latitude = latitude;
        location.longitude = longitude;
        await location.save();

        return res.status(200).json({ message: "Location updated successfully", location });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
      }
    },
  },
  // Delete a location
  deleteLocation: {
    validation: Joi.object({
      id: Joi.string().uuid().required(),
    }),
    handler: async (req, res) => {
      try {
        const { id } = req.params;

        const location = await Location.findByPk(id);
        if (!location) return res.status(404).json({ message: "Location not found" });

        await location.destroy();

        return res.status(200).json({ message: "Location deleted successfully" });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
      }
    },
  },
};

module.exports = locationController;