const Joi = require("joi");
const Group = require("../../../models/group");

const groupController = {
    createGroup: {
        validation: Joi.object({
            name: Joi.string().required(),
        }),

        handler: async (req, res) => {
            const { name } = req.body;

            try {
                await Group.create({ name });
                res.status(201).json({ success: true, message: "Group created successfully" });
            } catch (error) {
                res.status(500).json({ success: false, message: "Server Error", error: error.message });
            }
        },
    },
    getGroups: {
        handler: async (req, res) => {


            try {
                const groups = await Group.findAll({});
                res.status(200).json({ success: true, message: "Groups fetched successfully", groups });
            } catch (error) {
                res.status(500).json({ success: false, message: "Server Error", error: error.message });
            }
        },
    },
    updateGroup: {
        validation: Joi.object({
            id: Joi.string().required(),
            name: Joi.string().required(),
        }),

        handler: async (req, res) => {
            const { id, name } = req.body;

            try {
                await Group.update({ name }, { where: { id } });
                res.status(201).json({ success: true, message: "Group updated successfully" });
            } catch (error) {
                res.status(500).json({ success: false, message: "Server Error", error: error.message });
            }
        },
    },
    deleteGroup: {
        validation: Joi.object({
            id: Joi.string().required(),
        }),

        handler: async (req, res) => {
            const { id } = req.params;

            try {
                await Group.destroy({ where: { id } });
                res.status(201).json({ success: true, message: "Group deleted successfully" });
            } catch (error) {
                res.status(500).json({ success: false, message: "Server Error", error: error.message });
            }
        },
    },
};

module.exports = groupController;