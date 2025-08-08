const Joi = require("joi");
const Permission = require("../../../models/permission");

const permissionController = {
    createPermission: {
        validation: Joi.object({
            name: Joi.string().required(),
            category_id: Joi.string().required(),
        }),

        handler: async (req, res) => {
            const { name, category_id } = req.body;

            try {
                await Permission.create({ name, category_id });
                res.status(201).json({ success: true, message: "permission created successfully" });
            } catch (error) {
                res.status(500).json({ success: false, message: "Server Error", error: error.message });
            }
        },
    },
    getPermissions: {
        handler: async (req, res) => {
            try {
                const permissions = await Permission.findAll({});
                res.status(201).json({ success: true, message: "permission fetched successfully", permissions });
            } catch (error) {
                res.status(500).json({ success: false, message: "Server Error", error: error.message });
            }
        },
    }
};

module.exports = permissionController;