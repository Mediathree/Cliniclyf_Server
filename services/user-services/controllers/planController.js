const Joi = require("joi");
const Plan = require("../../../models/plan");

const planController = {
    createPlan: {
        validation: Joi.object({
            userType: Joi.string().required(),
            // planType: Joi.string().required(),
            name: Joi.string().required(),
            features: Joi.array().items(Joi.string()).required(),
            price: Joi.number().required(),
            durationInMonths: Joi.number().required(),
        }),

        handler: async (req, res) => {
            try {
                const plan = await Plan.create(req.body);
                res.status(201).json({ success: true, message: "Plan created successfully", plan });
            } catch (error) {
                res.status(500).json({ success: false, message: "Server Error", error: error.message });
            }
        },
    },
    getPlans: {
        handler: async (req, res) => {
            try {
                const plans = await Plan.find();
                res.status(200).json(plans);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },
    getPlanById: {
        validation: Joi.object({
            id: Joi.string().required(),
        }),

        handler: async (req, res) => {
            try {
                const plan = await Plan.findById(req.params.id);
                res.status(200).json(plan);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },
    updatePlan: {
        validation: Joi.object({
            userType: Joi.string().required(),
            planType: Joi.string().required(),
            name: Joi.string().required(),
            features: Joi.array().items(Joi.string()).required(),
            price: Joi.number().required(),
            durationInMonths: Joi.number().required(),
        }),

        handler: async (req, res) => {
            try {
                const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
                res.status(200).json(plan);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },
    deletePlan: {
        validation: Joi.object({
            id: Joi.string().required(),
        }),

        handler: async (req, res) => {
            try {
                const plan = await Plan.findByIdAndDelete(req.params.id);
                res.status(200).json(plan);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },
};

module.exports = planController;