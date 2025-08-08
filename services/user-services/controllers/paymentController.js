const Joi = require("joi");
const Payment = require("../../../models/payment");

const paymentController = {
    createPayment: {
        validation: Joi.object({
            amount: Joi.number().required(),
            payment_method: Joi.string().required(),
        }),
        handler: async (req, res) => {
            try {
                const payment = await Payment.create(req.body);
                res.status(201).json(payment);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },
    getPayment: {
        validation: Joi.object({
            id: Joi.string().required(),
        }),
        handler: async (req, res) => {
            try {
                const payment = await Payment.findById(req.params.id);
                res.status(200).json(payment);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },
    getPayments: {
        handler: async (req, res) => {
            try {
                const payments = await Payment.find();
                res.status(200).json(payments);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },
    updatePayment: {
        validation: Joi.object({
            amount: Joi.number().required(),
            payment_method: Joi.string().required(),
        }),
        handler: async (req, res) => {
            try {
                const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
                res.status(200).json(payment);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },
    deletePayment: {
        validation: Joi.object({
            id: Joi.string().required(),
        }),
        handler: async (req, res) => {
            try {
                const payment = await Payment.findByIdAndDelete(req.params.id);
                res.status(200).json(payment);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },
}

module.exports = paymentController;