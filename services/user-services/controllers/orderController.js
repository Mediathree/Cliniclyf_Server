const Joi = require("joi");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const Order = require("../../../models/order");
const Product = require("../../../models/product");
const Plan = require("../../../models/plan");
const Payment = require("../../../models/payment");
const OrderItem = require("../../../models/orderItem");
const ShippingAddress = require("../../../models/shippingAddress");

require("dotenv").config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const orderController = {
    createOrder: {
        validation: Joi.object({
            type: Joi.string().valid('PRODUCT', 'DOCTOR', 'CLINIC').required(),
            products: Joi.array().items(
                Joi.object({
                    productId: Joi.string().uuid().required(),
                    quantity: Joi.number().min(1).required()
                })
            ).when('type', { is: 'PRODUCT', then: Joi.required() }),
            paymentMethod: Joi.string().optional(),
            planType: Joi.string().optional(),
            isAdmin: Joi.boolean().optional()
        }),

        handler: async (req, res) => {
            try {
                const { type, planType, isAdmin, products, paymentMethod } = req.body;
                const userId = req.user.id;

                let amount = 0;
                let razorpayOrder;
                let dbProducts = null;
                let orderableId = null;

                if (type === 'PRODUCT') {
                    const productIds = products.map(p => p.productId);
                    dbProducts = await Product.findAll({ where: { id: productIds } });

                    if (dbProducts.length !== products.length) {
                        return res.status(400).json({ success: false, message: 'Some products not found.' });
                    }

                    products.forEach(item => {
                        const product = dbProducts.find(p => p.id === item.productId);
                        amount += product.price * item.quantity;
                    });

                    if (paymentMethod === "RAZORPAY") {
                        razorpayOrder = await razorpay.orders.create({
                            amount: amount * 100,
                            currency: 'INR',
                            receipt: 'receipt_' + Math.random().toString(36).substring(),
                            payment_capture: 1
                        });
                    }

                } else {
                    const plan = await Plan.findOne({ where: { userType: type, name: planType } });
                    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

                    orderableId = plan.id;
                    amount = plan.price;

                    if (planType === "PRO" && !isAdmin) {
                        razorpayOrder = await razorpay.orders.create({
                            amount: amount * 100,
                            currency: plan.currency,
                            receipt: 'receipt_' + Math.random().toString(36).substring(),
                            payment_capture: 1
                        });
                    }
                }

                const order = await Order.create({
                    razorpay_order_id: razorpayOrder?.id || null,
                    user_id: userId,
                    orderableType: type,
                    orderableId: orderableId,
                    amount,
                    status: razorpayOrder || paymentMethod === "CASH" ? 'PENDING' : 'PAID',
                });

                if (type === 'PRODUCT') {
                    const orderItems = products.map(p => {
                        const product = dbProducts.find(d => d.id === p.productId);
                        return {
                            orderId: order.id,
                            productId: p.productId,
                            quantity: p.quantity,
                            priceAtPurchase: product.price
                        };
                    });
                    await OrderItem.bulkCreate(orderItems);

                    if (paymentMethod === "CASH") {
                        await Payment.create({
                            user_id: userId,
                            payableId: order.id,
                            payableType: "PRODUCT",
                            paymentMethod: "CASH",
                            razorpayOrderId: null,
                            razorpayPaymentId: null,
                            razorpaySignature: null,
                            amount: null,
                            currency: 'INR',
                            status: "PENDING",
                        });
                    }
                }

                res.status(201).json({ success: true, message: "Order created successfully", data: order });

            } catch (error) {
                console.log(error);
                res.status(500).json({ success: false, message: "Server Error", error: error.message });
            }
        },
    },

    verifyOrder: {
        validation: Joi.object({
            razorpay_payment_id: Joi.string().required(),
            razorpay_order_id: Joi.string().required(),
            razorpay_signature: Joi.string().required(),
            payableId: Joi.string().uuid().required(), // order ID
            payableType: Joi.string().required(), // order ID
            shippingAddress: Joi.any().optional(),
            type: Joi.string().required(),
        }),

        handler: async (req, res) => {
            try {
                const {
                    razorpay_payment_id,
                    razorpay_order_id,
                    razorpay_signature,
                    payableId,
                    payableType,
                    shippingAddress,
                    type
                } = req.body;

                const userId = req.user.id;

                const order = await Order.findOne({ where: { id: payableId } });
                if (!order) {
                    return res.status(404).json({
                        success: false,
                        message: "Order not found",
                        data: null,
                    });
                }

                const generatedSignature = crypto
                    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                    .digest("hex");

                if (generatedSignature !== razorpay_signature) {
                    await Order.update({ status: "FAILED" }, { where: { id: payableId } });

                    return res.status(400).json({
                        success: false,
                        message: "Payment verification failed",
                        data: null,
                        error: "Invalid signature",
                    });
                }

                await Payment.create({
                    user_id: userId,
                    payableId: payableId,
                    payableType,
                    paymentMethod: "RAZORPAY",
                    razorpayOrderId: razorpay_order_id,
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    amount: order.amount,
                    currency: order.currency,
                    status: "PAID",
                });

                await Order.update(
                    { status: "PAID" },
                    { where: { id: payableId } }
                );

                if (type === 'PRODUCT') {
                    await ShippingAddress.create({ ...shippingAddress, userId, orderId: payableId });
                }

                return res.status(200).json({
                    success: true,
                    message: "Payment verified successfully",
                    data: payableId,
                    error: null,
                });
            } catch (error) {
                console.error("Verify payment error:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to verify payment",
                    data: null,
                    error:
                        process.env.NODE_ENV === "development"
                            ? error.stack
                            : "Internal server error",
                });
            }
        },
    },

    getOrders: {
        handler: async (req, res) => {
            try {
                const orders = await Order.find();
                res.status(200).json(orders);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },

    getOrderById: {
        validation: Joi.object({
            id: Joi.string().required(),
        }),

        handler: async (req, res) => {
            try {
                const order = await Order.findById(req.params.id);
                res.status(200).json(order);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },

    updateOrder: {
        validation: Joi.object({
            orderableType: Joi.string().required(),
            orderableId: Joi.string().required(),
            amount: Joi.number().required(),
            status: Joi.string().required(),
            paymentId: Joi.string().required(),
            paymentMethod: Joi.string().required(),
        }),

        handler: async (req, res) => {
            try {
                const order = await Order.findByIdAndUpdate(
                    req.params.id,
                    req.body,
                    { new: true }
                );
                res.status(200).json(order);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },

    deleteOrder: {
        validation: Joi.object({
            id: Joi.string().required(),
        }),
        handler: async (req, res) => {
            try {
                const order = await Order.findByIdAndDelete(req.params.id);
                res.status(200).json(order);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },
}

module.exports = orderController;