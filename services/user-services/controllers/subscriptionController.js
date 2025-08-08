const Joi = require("joi");
const moment = require("moment");

const Subscription = require("../../../models/subscription");
const Plan = require("../../../models/plan");
const Order = require("../../../models/order");
const User = require("../../../models/user");

const subscriptionController = {
    createSubscription: {
        validation: Joi.object({
            userType: Joi.string().required(),
            planType: Joi.string().required(),
            subscriberId: Joi.string().required(),
            orderId: Joi.string().required(),
        }),
        handler: async (req, res) => {
            try {
                const { userType, subscriberId, planType, orderId } = req.body;

                let planInstance = await Plan.findOne({
                    where: {
                        userType, name: planType
                    }
                });
                if (!planInstance) return res.status(404).json({ success: false, message: "Plan not found" });

                const plan = planInstance?.get({ plain: true });

                const isSubscriptionExist = await Subscription.findOne({
                    where: {
                        subscriber_id: subscriberId,
                        status: "ACTIVE"
                    }
                });

                if (isSubscriptionExist) {
                    await Subscription.update({ status: "CANCELLED" }, {
                        where: {
                            subscriber_id: subscriberId
                        }
                    })
                }

                // Get current date as start date
                const startDate = moment(); // current date

                // Calculate end date
                const endDate = moment(startDate).add(plan.durationInMonths, 'months');

                const subscription = await Subscription.create({ user_id: req.user.id, subscriberType: userType, subscriber_id: subscriberId, plan_id: plan.id, startDate, endDate, status: "ACTIVE", order_id: orderId });

                res.status(201).json({ success: true, message: "Subscription created successfully", data: subscription });
            } catch (error) {
                res.status(500).json({ success: false, message: "Internal server error", error: error.message });
            }
        },
    },

    getSubscription: {
        handler: async (req, res) => {
            try {
                const subscription = await Subscription.findAll({
                    include: [
                        {
                            model: User,
                            as: 'subscribedFor',
                            attributes: ['id', 'name', 'email', 'mobile_no']
                        },
                        {
                            model: Plan,
                            attributes: ['id', 'name', 'userType']
                        }
                    ]
                });
                res.status(200).json({ success: true, message: "Subscriptions fetched successfully", data: subscription, error: null });
            } catch (error) {
                console.log(error.message)
                res.status(500).json({ success: false, message: "Server error", data: null, error: "Server error" });
            }
        },
    },
    getSubscriptions: {
        handler: async (req, res) => {
            try {
                const subscriptions = await Subscription.find();
                res.status(200).json(subscriptions);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },
    updateSubscription: {
        validation: Joi.object({
            id: Joi.string().required(),
            user_id: Joi.string().required(),
            plan: Joi.string().required(),
            payment_method: Joi.string().required(),
            amount: Joi.number().required(),
            status: Joi.string().required(),
            start_date: Joi.date().required(),
            end_date: Joi.date().required(),
        }),
        handler: async (req, res) => {
            try {
                const subscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true });
                res.status(200).json(subscription);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },
    deleteSubscription: {
        validation: Joi.object({
            id: Joi.string().required(),
        }),
        handler: async (req, res) => {
            const { id } = req.params;

            try {
                await Subscription.update({ status: "CANCELLED" }, {
                    where: {
                        id
                    }
                });
                res.status(200).json({ success: true, message: "Subscription deleted successfully", date: null, error: null });
            } catch (error) {
                console.log(error.message)
                res.status(500).json({ success: false, message: "Server error", date: null, error: "Server error" });
            }
        },
    },
}

module.exports = subscriptionController;