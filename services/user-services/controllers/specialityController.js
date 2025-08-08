const Joi = require("joi");
const Speciality = require("../../../models/speciality");

const specialityController = {

    createSpeciality: {
    validation: Joi.object({
      name: Joi.string().required().min(3),
    }),

    handler: async (req, res) => {
      try {
        const { name } = req.body;

        const specialityExists = await Speciality.findOne({ where: { name } });
        if (specialityExists) return res.status(400).json({ message: "Speciality already exists" });

        const speciality = await Speciality.create({ name });

        return res.status(201).json({ message: "Speciality created successfully", speciality });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
      }
    },
  },

  // Get all specialities
  getSpecialities: {
    handler: async (req, res) => {
      try {
        const specialities = await Speciality.findAll();
        return res.status(200).json({ specialities });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
      }
    },
  },

  // Get a specific speciality by ID
  getSpecialityById: {
    validation: Joi.object({
      id: Joi.string().uuid().required(),
    }),

    handler: async (req, res) => {
      try {
        const { id } = req.params;

        const speciality = await Speciality.findByPk(id);
        if (!speciality) return res.status(404).json({ message: "Speciality not found" });

        return res.status(200).json({ speciality });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
      }
    },
  },

  // Update a speciality
  updateSpeciality: {
    validation: Joi.object({
      id: Joi.string().uuid().required(),
      name: Joi.string().required().min(3),
    }),

    handler: async (req, res) => {
      try {
        const { id, name } = req.body;

        const speciality = await Speciality.findByPk(id);
        if (!speciality) return res.status(404).json({ message: "Speciality not found" });

        speciality.name = name;
        await speciality.save();

        return res.status(200).json({ message: "Speciality updated successfully", speciality });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
      }
    },
  },

  // Delete a speciality
  deleteSpeciality: {
    validation: Joi.object({
      id: Joi.string().uuid().required(),
    }),

    handler: async (req, res) => {
      try {
        const { id } = req.params;

        const speciality = await Speciality.findByPk(id);
        if (!speciality) return res.status(404).json({ message: "Speciality not found" });

        await speciality.destroy();

        return res.status(200).json({ message: "Speciality deleted successfully" });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
      }
    },
  },
};

module.exports = specialityController;
