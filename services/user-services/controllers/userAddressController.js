const Joi = require("joi");
const UserAddress = require("../../../models/address");
const User = require("../../../models/user");
const { Op } = require("sequelize");

const userAddressController = {
  // Create a new address for a user
  createAddress: {
    validation: Joi.object({
      address_line_1: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      postal_code: Joi.string().length(6).required(),
    }),
    handler: async (req, res) => {
      try {
        const { address_line_1, city, state, postal_code } = req.body;
        const user_id = req.user.id; // Get logged-in user ID from JWT

        const address = await UserAddress.create({ user_id, address_line_1, city, state, postal_code });

        res.status(201).json({ message: "Address created successfully", address });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
      }
    },
  },

  // Get all addresses for a user
  getUserAddresses: {
    handler: async (req, res) => {
      try {
        const { location } = req.query;

        if (!location) {
          return res.status(400).json({ message: "Location query parameter is required." });
        }

        const users = await User.findAll({
          where: {
            role_id: { [Op.in]: [process.env.DOCTOR_ROLE_ID, process.env.CLINIC_ROLE_ID] }
          },
          include: [
            {
              model: UserAddress,
              where: {
                [Op.or]: [
                  { city: { [Op.iLike]: `%${location}%` } },
                  { state: { [Op.iLike]: `%${location}%` } }
                ]
              },
              required: true
            }
          ],
          attributes: ['id', 'name', 'email', 'role_id'],
        });

        res.status(200).json({ users });
      } catch (error) {
        console.error("Error searching users by location:", error.message);
        res.status(500).json({ message: "Server Error" });
      }
    }
  },

  // Get a specific address by ID
  getAddressById: {
    validation: Joi.object({
      id: Joi.string().uuid().required(),
    }),

    handler: async (req, res) => {
      try {
        const { id } = req.params;
        const user_id = req.user.id;

        const address = await UserAddress.findOne({ where: { id, user_id } });
        if (!address) return res.status(404).json({ message: "Address not found" });

        res.status(200).json({ address });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
      }
    },
  },

  // Update an address
  updateAddress: {
    validation: Joi.object({
      id: Joi.string().uuid().required(),
      address_line_1: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      postal_code: Joi.string().length(6).required(),
    }),

    handler: async (req, res) => {
      try {
        const { id, address_line_1, city, state, postal_code } = req.body;
        const user_id = req.user.id;

        const address = await UserAddress.findOne({ where: { id, user_id } });
        if (!address) return res.status(404).json({ message: "Address not found" });

        address.address_line_1 = address_line_1;
        address.city = city;
        address.state = state;
        address.postal_code = postal_code;
        await address.save();

        res.status(200).json({ message: "Address updated successfully", address });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
      }
    },
  },



  // Delete an address
  deleteAddress: {
    validation: Joi.object({
      id: Joi.string().uuid().required(),
    }),

    handler: async (req, res) => {
      try {
        const { id } = req.params;
        const user_id = req.user.id;

        const address = await UserAddress.findOne({ where: { id, user_id } });
        if (!address) return res.status(404).json({ message: "Address not found" });

        await address.destroy();
        res.status(200).json({ message: "Address deleted successfully" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
      }
    },
  },
};



module.exports = userAddressController;
