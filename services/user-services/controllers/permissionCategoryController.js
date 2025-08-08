const Joi = require("joi");
const PermissionCategory = require("../../../models/permissionCategory");
const Permission = require("../../../models/permission");

const permissionCategoryController = {
    createPermissionCategory: {
        validation: Joi.object({
            name: Joi.string().required(),
        }),

        handler: async (req, res) => {
            try {
                await PermissionCategory.create({ name: req.body.name });
                res.status(201).json({ success: true, message: "permissionCategory created successfully" });
            } catch (error) {
                res.status(500).json({ success: false, message: "Server Error", error: error.message });
            }
        },
    },
    getPermissionCategory: {
        handler: async (req, res) => {
            try {
                const permissionCategories = await PermissionCategory.findAll({
                    attributes: ['id', 'name'],
                    include: [{
                        model: Permission,
                        attributes: ['id', 'name'],
                        required: false
                    }]
                });
                res.status(200).json({ success: true, message: "permissionCategory fetched successfully", permissionCategories });
            } catch (error) {
                res.status(500).json({ success: false, message: "Server Error", error: error.message });
            }
        },
    }
};

module.exports = permissionCategoryController;