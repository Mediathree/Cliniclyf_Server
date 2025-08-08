const Joi = require("joi");
require("dotenv").config();

const Settings = require("../../../models/settings");

const settingsController = {
    upsertSetting: {
        handler: async (req, res) => {
            try {
                const id = req.user.id;

                await Settings.upsert({ user_id: id, ...req.body });

                res.status(201).json({ success: true, message: "Settings created/updated successfully", data: null });
            } catch (error) {
                res.status(500).json({ success: false, message: "Internal server error", error: error.message });
            }
        },
    },

    getSettings: {
        handler: async (req, res) => {
            try {
                const settings = await Settings.findOne({
                    where: {
                        user_id: process.env.ADMIN_ID
                    }
                });
                res.status(200).json({ success: true, message: "settings fetched successfully", data: settings, error: null });
            } catch (error) {
                console.log(error.message)
                res.status(500).json({ success: false, message: "Server error", data: null, error: "Server error" });
            }
        },
    },
}

module.exports = settingsController;