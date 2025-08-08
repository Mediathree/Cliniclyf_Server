const Joi = require("joi");
const Appointment = require("../../../models/appointment");
const Payment = require("../../../models/payment");
const Razorpay = require("razorpay");
const crypto = require("crypto");

require("dotenv").config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const appointmentController = {
    createAppointment: {
        validation: Joi.object({
            patient_id: Joi.string().required(),
            doctor_id: Joi.string().required(),
            clinic_id: Joi.string().required(),
            date: Joi.string().required(),
            time: Joi.string().required(),
            status: Joi.string().valid("pending").required(),
            name: Joi.string().required(),
            location: Joi.string().required(),
            consultationType: Joi.string().required(),
            healthConcern: Joi.string().required(),
            fee: Joi.number().required(),
            paymentMode: Joi.string().valid("RAZORPAY", "CASH").required(),
        }),

        handler: async (req, res) => {
            const t = await Appointment.sequelize.transaction();
            try {
                const {
                    patient_id,
                    doctor_id,
                    clinic_id,
                    date,
                    time,
                    status,
                    name,
                    location,
                    consultationType,
                    healthConcern,
                    fee,
                    paymentMode
                } = req.body;

                // 1. Create the appointment
                const appointment = await Appointment.create({
                    patient_id,
                    doctor_id,
                    clinic_id,
                    date,
                    time,
                    status,
                    name,
                    location,
                    consultation_type: consultationType,
                    health_concern: healthConcern,
                    fee
                }, { transaction: t });

                let paymentData = {
                    user_id: patient_id,
                    payableId: appointment.id,
                    payableType: "APPOINTMENT",
                    paymentMethod: paymentMode,
                    amount: fee,
                    currency: "INR",
                    status: "PENDING"
                };

                let razorpayOrder = null;

                if (paymentMode === "RAZORPAY") {
                    razorpayOrder = await razorpay.orders.create({
                        amount: Math.round(fee * 100), // Razorpay expects amount in paise
                        currency: "INR",
                        receipt: `receipt_${Math.random().toString(20).substring()}`,
                        payment_capture: 1
                    });
                    paymentData.razorpayOrderId = razorpayOrder.id;
                }

                console.log("Razorpay Order Created:", razorpayOrder);

                const payment = await Payment.create(paymentData, { transaction: t });

                await t.commit();

                res.status(201).json({
                    success: true,
                    message: "Appointment Created Successfully",
                    appointment,
                    payment,
                    razorpayOrder
                });
            } catch (error) {
                await t.rollback();
                res.status(500).json({ success: false, message: "Server error", error: error.message });
            }
        },
    },
    verifyAppointment: {
        validation: Joi.object({
            razorpay_payment_id: Joi.string().required(),
            razorpay_order_id: Joi.string().required(),
            razorpay_signature: Joi.string().required(),
            payableId: Joi.string().uuid().required(), // appointment ID
        }),

        handler: async (req, res) => {
            try {
                const {
                    razorpay_payment_id,
                    razorpay_order_id,
                    razorpay_signature,
                    payableId
                } = req.body;

                // Find the appointment
                const appointment = await Appointment.findOne({ where: { id: payableId } });
                if (!appointment) {
                    return res.status(404).json({
                        success: false,
                        message: "Appointment not found",
                    });
                }

                // Find the payment record
                const payment = await Payment.findOne({
                    where: {
                        payableId: payableId,
                        payableType: "APPOINTMENT",
                        razorpayOrderId: razorpay_order_id
                    }
                });

                if (!payment) {
                    return res.status(404).json({
                        success: false,
                        message: "Payment record not found",
                    });
                }

                // Verify signature
                const generatedSignature = crypto
                    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                    .digest("hex");

                if (generatedSignature !== razorpay_signature) {
                    await payment.update({ status: "FAILED" });

                    return res.status(400).json({
                        success: false,
                        message: "Payment verification failed",
                        error: "Invalid signature",
                    });
                }

                // Update payment as PAID
                await payment.update({
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    status: "PAID"
                });

                await appointment.update({ status: "scheduled" });

                return res.status(200).json({
                    success: true,
                    message: "Payment verified successfully",
                    data: payableId,
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Failed to verify payment",
                    error: "Internal server error",
                });
            }
        },
    },
    getAppointment: {
        handler: async (req, res) => {
            try {
                const appointment = await Appointment.find();
                res.status(200).json(appointment);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },
    getAppointmentById: {
        handler: async (req, res) => {
            try {
                const appointment = await Appointment.findById(req.params.id);
                res.status(200).json(appointment);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },
    updateAppointment: {
        validation: Joi.object({
            patient_id: Joi.string().required(),
            doctor_id: Joi.string().required(),
            clinic_id: Joi.string().required(),
            time: Joi.string().required(),
            status: Joi.string().required(),
            payment_id: Joi.string().required(),
        }),

        handler: async (req, res) => {
            try {
                const appointment = await Appointment.findByIdAndUpdate(
                    req.params.id,
                    req.body,
                    { new: true }
                );
                res.status(200).json(appointment);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },
    deleteAppointment: {
        handler: async (req, res) => {
            try {
                const appointment = await Appointment.findByIdAndDelete(
                    req.params.id
                );
                res.status(200).json(appointment);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        },
    },
    getAppointmentDashboardStat: {
        handler: async (req, res) => {
            try {
                const upcomingAppointment = await Appointment.find({
                    where: {
                        status: "scheduled"
                    }
                });
                const completedAppointment = await Appointment.find({
                    where: {
                        status: "completed"
                    }
                });
                const cancelledAppointment = await Appointment.find({
                    where: {
                        status: "cancelled"
                    }
                });


                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

                const [paidThisMonth, paidLastMonth] = await Promise.all([
                    Payment.findAll({ where: { status: 'PAID', createdAt: { [Op.gte]: startOfMonth } } }),
                    Payment.findAll({ where: { status: 'PAID', createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] } } }),
                ]);

                const currentMonthEarnings = paidThisMonth.reduce((sum, p) => sum + (p.amount || 0), 0);
                const lastDayMonthEarnings = paidLastMonth.reduce((sum, p) => sum + (p.amount || 0), 0);


                res.status(200).json({ success: true, message: "All dashboard data retrieve successfully", data: { upcomingAppointment, completedAppointmentCount: completedAppointment.length, cancelledAppointmentCount: cancelledAppointment.length, currentMonthEarnings, lastDayMonthEarnings } });
            } catch (error) {
                res.status(500).json({ success: false, message: "Server error", error: error.message });
            }
        },
    },
}

module.exports = appointmentController;