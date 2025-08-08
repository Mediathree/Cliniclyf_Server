const Joi = require("joi");
const User_Group = require("../../../models/user_group");
const User = require("../../../models/user");

const user_group_Controller = {
    add_user_group: {
        validation: Joi.object({
            user_id: Joi.string().required(),
            group_id: Joi.string().required(),
        }),

        handler: async (req, res) => {
            const { user_id, group_id } = req.body;

            try {
                await User_Group.create({ user_id, group_id });
                res.status(201).json({ success: true, message: "user_group added successfully" });
            } catch (error) {
                res.status(500).json({ success: false, message: "Server Error", error: error.message });
            }
        },
    },
    get_user_group: {

        handler: async (req, res) => {
            const { group_id } = req.params;

            try {
                const usersInGroup = await User_Group.findAll({
                    where: {
                        group_id
                    },
                    attributes: ['user_id'],
                    include: [
                        {
                            model: User,
                            attributes: ['name']
                        }
                    ]
                });
                res.status(200).json({ success: true, message: "usersInGroup fetched successfully", usersInGroup });
            } catch (error) {
                console.log(error.message)
                res.status(500).json({ success: false, message: "Server Error", error: error.message });
            }
        },
    },
    remove_user_group: {
        validation: Joi.object({
            user_id: Joi.string().required(),
            group_id: Joi.string().required(),
        }),

        handler: async (req, res) => {
            const { user_id, group_id } = req.query;

            try {
                await User_Group.destroy({ where: { user_id, group_id } });
                res.status(201).json({ success: true, message: "user_group deleted successfully" });
            } catch (error) {
                res.status(500).json({ success: false, message: "Server Error", error: error.message });
            }
        },
    },
};

module.exports = user_group_Controller;