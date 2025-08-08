const Joi = require("joi");
const bcrypt = require("bcryptjs");
const User = require("../../../models/user");
const { generateToken } = require("../../../config/utils/jwtHelper");
const Role = require("../../../models/role");
const Photo = require("../../../models/photo");
const { Op } = require("sequelize");

const authController = {
  register: {
    validation: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      mobile_no: Joi.string().required(),
      role: Joi.string().required(),
    }),

    handler: async (req, res) => {
      try {
        let { name, email, mobile_no, role } = req.body;

        let userExists = await User.findOne({ where: { email } });
        if (userExists) return res.status(400).json({ success: false, message: "Email already exists", data: null, error: "Email already exists" });

        userExists = await User.findOne({ where: { mobile_no } });
        if (userExists) return res.status(400).json({ success: false, message: "Mobile Number already exists", data: null, error: "Mobile Number already exists" });

        role = await Role.findOne({ where: { name: role } });
        if (!role) {
          return res.status(404).json({ success: false, message: "Role not found", data: null, error: "Role not found" })
        }

        const defaultPassword = "123"

        const user = await User.create({ name, email, mobile_no, password: defaultPassword, role_id: role.id });

        const token = generateToken(user);

        res.status(201).json({ success: true, message: "User created successfully", data: { user, token } });
      } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Server Error", data: null, error: error.message });
      }
    },
  },

  login: {
    validation: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),

    handler: async (req, res) => {
      try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ success: false, message: "Invalid Credentials", data: null, error: "Invalid Credentials" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ success: false, message: "Invalid Credentials", data: null, error: "Invalid Credentials" });

        const token = generateToken(user);

        res.json({ success: true, message: "Logged in successfully", data: { user, token } });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error", data: null, error: error.message });
      }
    },
  },
};


const userController = {
  getUsers: {

    handler: async (req, res) => {
      try {
        const users = await User.findAll({ include: { model: Role, attributes: ['name'] } });

        res.status(200).json({ success: true, message: "Users fetched successfully", users });
      } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: true, message: "Server error", data: null, error: "Server error" });
      }
    },
  },

  getSetting: {
    handler: async (req, res) => {
      try {
        const settings = await User.findOne({
          where: {
            id: req.user.id
          },
          attributes: ['site_logo', 'site_name', 'support_email', 'support_phone', 'enable_maintainance', 'maintainance_reason']
        });

        res.status(200).json({ success: true, message: "Settings fetched successfully", data: settings });
      } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: true, message: "Server error", data: null, error: "Server error" });
      }
    },
  },

  updateUser: {
    validation: Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      mobile_no: Joi.string().required(),
    }),
    handler: async (req, res) => {
      try {
        const { id, name, email, mobile_no } = req.body;

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ success: false, message: "User not found", data: null, error: "User not found" });

        let userExists = await User.findOne({ where: { email, id: { [Op.ne]: id } } });
        if (userExists) return res.status(400).json({ success: false, message: "Email already exists", data: null, error: "Email already exists" });

        userExists = await User.findOne({ where: { mobile_no, id: { [Op.ne]: id } } });
        if (userExists) return res.status(400).json({ success: false, message: "Mobile Number already exists", data: null, error: "Mobile Number already exists" });

        await User.update({ name, email, mobile_no }, {
          where: {
            id
          }
        });

        res.status(200).json({ success: true, message: "User updated successfully", data: null, error: null });
      } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: true, message: "Server error", data: null, error: "Server error" });
      }
    },
  },

  updateSetting: {
    validation: Joi.object({
      site_logo: Joi.string().optional(),
      site_name: Joi.string().optional(),
      support_email: Joi.string().optional(),
      support_phone: Joi.string().optional(),
      enable_maintainance: Joi.boolean().optional(),
      maintainance_reason: Joi.string().optional(),
    }),
    handler: async (req, res) => {
      try {
        const id = req.user.id;

        const { site_logo, site_name, support_email, support_phone, enable_maintainance, maintainance_reason } = req.body;

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ success: false, message: "User not found", data: null, error: "User not found" });

        await User.update({ site_logo: req.file ? req.file.path : site_logo, site_name, support_email, support_phone, enable_maintainance, maintainance_reason }, {
          where: {
            id
          }
        });

        res.status(200).json({ success: true, message: "setting updated successfully", data: null, error: null });
      } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: true, message: "Server error", data: null, error: "Server error" });
      }
    },
  },

  deleteUser: {
    validation: Joi.object({
      id: Joi.string().required(),
    }),
    handler: async (req, res) => {
      try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ success: false, message: "User not found", data: null, error: "User not found" });

        await User.destroy({
          where: {
            id
          }
        });

        res.status(200).json({ success: true, message: "User deleted successfully", data: null, error: null });
      } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: true, message: "Server error", data: null, error: "Server error" });
      }
    },
  },
};


module.exports = { authController, userController };
