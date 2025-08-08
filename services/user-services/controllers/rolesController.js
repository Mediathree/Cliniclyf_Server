const Joi = require("joi");
const Role = require("../../../models/role");
const { authMiddleware, roleMiddleware } = require("../../../middleware/authMiddleware");

const roleController = {
  // Create a new role
  createRole: {
    validation: Joi.object({
      name: Joi.string().required().min(3),
    }),

    handler: async (req, res) => {
      try {
        const { name } = req.body;

        const roleExists = await Role.findOne({ where: { name } });
        if (roleExists) return res.status(400).json({ message: "Role already exists" });

        const role = await Role.create({ name });

        return res.status(201).json({ message: "Role created successfully", role });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
      }
    },
  },

  // Get all roles
  getRoles: {
    handler: async (req, res) => {
      try {
        const roles = await Role.findAll();
        return res.status(200).json({ roles });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
      }
    },
  },

  // Get a specific role by ID
  getRoleById: {
    validation: Joi.object({
      id: Joi.string().uuid().required(),
    }),

    handler: async (req, res) => {
      try {
        const { id } = req.params;

        const role = await Role.findByPk(id);
        if (!role) return res.status(404).json({ message: "Role not found" });

        return res.status(200).json({ role });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
      }
    },
  },

  // Update an existing role
  updateRole: {
    validation: Joi.object({
      id: Joi.string().uuid().required(),
      name: Joi.string().required().min(3),
    }),

    handler: async (req, res) => {
      try {
        const { id, name } = req.body;

        const role = await Role.findByPk(id);
        if (!role) return res.status(404).json({ message: "Role not found" });

        role.name = name;
        await role.save();

        return res.status(200).json({ message: "Role updated successfully", role });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
      }
    },
  },

  // Delete a role
  deleteRole: {
    validation: Joi.object({
      id: Joi.string().uuid().required(),
    }),

    handler: async (req, res) => {
      try {
        const { id } = req.params;

        const role = await Role.findByPk(id);
        if (!role) return res.status(404).json({ message: "Role not found" });

        await role.destroy();

        return res.status(200).json({ message: "Role deleted successfully" });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
      }
    },
  },
};

module.exports = roleController;
