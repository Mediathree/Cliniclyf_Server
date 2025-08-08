const Joi = require("joi");

const User = require("../../../models/user");
const { Doctor, Timing, WorkingDay } = require("../../../models/doctor");
const Photo = require("../../../models/photo");
const Address = require("../../../models/address");
const Rating = require("../../../models/rating");
const { Op, Sequelize } = require("sequelize");
const { sendEmail } = require("../../emailService");
const Appointment = require("../../../models/appointment");
const Payment = require("../../../models/payment");
const moment = require("moment");

const updateItem = async (Model, items, user_id, item1, item2) => {
    // Step 1: Fetch existing services from DB
    const existingItems = await Model.findAll({ where: { user_id } });

    // Step 2: Extract incoming service IDs (existing only)
    const incomingItemIds = items
        .filter(item => item.id)
        .map(item => item.id);


    // Step 3: Delete removed services
    const itemsToDelete = existingItems.filter(
        item => !incomingItemIds.includes(item.id)
    );

    for (const item of itemsToDelete) {
        await item.destroy();
    }

    // Step 4: Upsert the incoming services
    for (const item of items) {
        await Model.upsert({
            user_id,
            id: item.id, // undefined for new, used for existing
            [item1]: item[item1],
            [item2]: item[item2]
        });
    }
}

const doctorController = {
    createDoctor: {
        validation: Joi.object({
            userId: Joi.string().required(),
            specialization: Joi.string().required(),
            age: Joi.string().required(),
            gender: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            about: Joi.string().required(),
            appointmentFee: Joi.string().required(),
            timings: Joi.any(),
            workingDays: Joi.any(),
        }),

        handler: async (req, res) => {
            try {
                const { userId, specialization, age, gender, city, state, about, appointmentFee, timings, workingDays } = req.body;

                const doctorExists = await Doctor.findOne({ where: { user_id: userId } });
                if (doctorExists) return res.status(400).json({ success: false, message: "Doctor already exists", data: null, error: "Doctor already exists" });

                const doctor = await Doctor.create({ user_id: userId, specialization, age, gender, about, appointmentFee });

                if (doctor) {
                    await Address.create({ user_id: userId, city, state });

                    if (req.file) {
                        await Photo.create({ photoable_id: userId, url: req.file.path, name: req.file.originalname });
                    }

                    for (let timing of JSON.parse(timings)) {
                        await Timing.create({ user_id: userId, time: timing.time, slot: timing.slot })
                    }

                    for (let workingDay of JSON.parse(workingDays)) {
                        await WorkingDay.create({ user_id: userId, day: workingDay.day, slot: workingDay.slot })
                    }
                }

                return res.status(201).json({ success: true, message: "Doctor created successfully", doctor });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
            }
        },
    },

    // Get all doctors
    getDoctors: {
        handler: async (req, res) => {
            const query = {};
            if (req.query.search) {
                query.name = { [Op.iRegexp]: req.query.search };
            }

            try {
                const doctors = await Doctor.findAll({
                    include: [
                        {
                            model: User,
                            where: query,
                            include: [
                                {
                                    model: Address,
                                    attributes: ['city', 'state'],
                                    required: false
                                },
                                {
                                    model: Photo,
                                    attributes: ['url'],
                                    required: false
                                },
                                {
                                    model: Rating,
                                    as: "receivedBy",
                                    required: false
                                }
                            ],

                        },
                        {
                            model: User,
                            as: 'clinic', // alias matches the association
                            attributes: ['id', 'name', 'email'], // choose what clinic data you want
                            required: false
                        }
                    ]
                });

                return res.status(200).json({ success: true, message: "Doctors fetched successfully", data: doctors });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
            }
        },
    },

    // Get assigned doctors
    getAssignedDoctors: {
        handler: async (req, res) => {
            const id = req.params.id;

            try {
                const doctors = await Doctor.findAll({
                    where: { clinic_id: id },
                    attributes: ['id', 'specialization'],
                    include: [
                        {
                            model: User,
                            attributes: ['id', 'name']
                        }
                    ]
                });

                return res.status(200).json({ success: true, message: "Doctors fetched successfully", data: doctors });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
            }
        },
    },

    assignDoctor: {

        handler: async (req, res) => {
            try {
                const { doctorId, clinicId } = req.query;

                const doctor = await Doctor.findOne({ where: { user_id: doctorId } });
                if (!doctor) return res.status(404).json({ message: "Doctor not found" });

                await Doctor.update({ clinic_id: clinicId }, {
                    where: {
                        user_id: doctorId
                    }
                });

                return res.status(200).json({ success: true, message: "Doctor Assigned successfully", data: null, error: null });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ success: false, message: "Server error", data: null, error: "Server error" });
            }
        },
    },

    dischargeDoctor: {

        handler: async (req, res) => {
            try {
                const { doctorId } = req.query;

                const doctor = await Doctor.findOne({ where: { user_id: doctorId } });
                if (!doctor) return res.status(404).json({ message: "Doctor not found" });

                await Doctor.update({ clinic_id: null }, {
                    where: {
                        user_id: doctorId
                    }
                });

                return res.status(200).json({ success: true, message: "Doctor Discharged successfully", data: null, error: null });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ success: false, message: "Server error", data: null, error: "Server error" });
            }
        },
    },

    // Get a specific doctor by ID
    getDoctorById: {
        validation: Joi.object({
            id: Joi.string().uuid().required(),
        }),

        handler: async (req, res) => {
            try {
                const { id } = req.params;

                const doctor = await Doctor.findByPk(id, {
                    include: [
                        {
                            model: Address,
                            as: 'addresses',
                            attributes: ['street', 'city', 'state'],
                            where: { addressableId: id }
                        },
                        {
                            model: Photo,
                            as: "photos",
                            attributes: ['url'],
                            where: { photoableId: id }
                        },
                        {
                            model: Rating,
                            as: "ratings",
                            attributes: ['rating', 'review'],
                            where: { reviewableId: id },
                            required: false
                        }
                    ]
                });

                if (!doctor) return res.status(404).json({ message: "Doctor not found" });

                return res.status(200).json({ doctor });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
            }
        },
    },

    // Update a doctor  
    updateDoctor: {
        validation: Joi.object({
            user_id: Joi.string().required(),
            photo: Joi.string().optional(),
            specialization: Joi.string().required(),
            age: Joi.string().required(),
            gender: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            about: Joi.string().required(),
            appointmentFee: Joi.string().required(),
            timings: Joi.any(),
            workingDays: Joi.any(),
        }),

        handler: async (req, res) => {
            try {
                const { user_id, specialization, age, gender, city, state, about, appointmentFee, timings, workingDays } = req.body;

                const doctor = await Doctor.findOne({ where: { user_id } });
                if (!doctor) return res.status(404).json({ message: "Doctor not found" });

                await Doctor.update({ specialization, age, gender, about, appointmentFee }, {
                    where: {
                        user_id
                    }
                });

                await Address.update({ city, state }, {
                    where: {
                        user_id
                    }
                });

                if (req.file) {
                    await Photo.update({ url: req.file.path, name: req.file.originalname }, {
                        where: {
                            photoable_id: user_id
                        }
                    });
                }

                if (timings) await updateItem(Timing, timings, user_id, "time", "slot");

                if (workingDays) await updateItem(Timing, workingDays, user_id, "day", "slot");

                return res.status(200).json({ success: true, message: "Doctor updated successfully", data: null, error: null });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ success: false, message: "Server error", data: null, error: "Server error" });
            }
        },
    },

    // Delete a doctor    
    deleteDoctor: {
        validation: Joi.object({
            id: Joi.string().uuid().required(),
        }),

        handler: async (req, res) => {
            try {
                const { id } = req.params;

                const doctor = await Doctor.findByPk(id);
                if (!doctor) return res.status(404).json({ message: "Doctor not found" });

                await doctor.destroy();

                return res.status(200).json({ message: "Doctor deleted successfully" });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
            }
        },
    },

    // Register a doctor
    registerDoctor: {
        validation: Joi.object({
            doctorName: Joi.string().required().messages({
                "string.base": "Doctor name must be a string.",
                "string.empty": "Doctor name is required.",
                "any.required": "Doctor name is required.",
            }),
            doctorMobileNumber: Joi.string()
                .pattern(/^[1-9][0-9]{9}$/)
                .required()
                .messages({
                    "string.pattern.base":
                        "Doctor mobile number must be a valid 10-digit number.",
                    "string.empty": "Doctor mobile number is required.",
                    "any.required": "Doctor mobile number is required.",
                }),
            doctorClinicAddress: Joi.string().required().messages({
                "string.base": "Clinic address must be a string.",
                "string.empty": "Clinic address is required.",
                "any.required": "Clinic address is required.",
            }),
            doctorEmailId: Joi.string().email().required().messages({
                "string.base": "Email must be a string.",
                "string.empty": "Email is required.",
                "string.email": "Email must be a valid email address.",
                "any.required": "Email is required.",
            }),
        }),

        handler: async (req, res) => {
            try {
                const {
                    doctorName,
                    doctorMobileNumber,
                    doctorClinicAddress,
                    doctorEmailId,
                } = req.body;

                // Fetch admin user by role_id
                const adminUser = await User.findOne({
                    where: { role_id: process.env.ADMIN_ROLE_ID },
                });

                if (!adminUser) {
                    return res.status(404).json({ message: "Admin user not found." });
                }

                // Email content
                const subject = "New Doctor Registration Request";
                const html = `
                <h3>New Doctor Details</h3>
                <p><strong>Name:</strong> ${doctorName}</p>
                <p><strong>Mobile:</strong> ${doctorMobileNumber}</p>
                <p><strong>Email:</strong> ${doctorEmailId}</p>
                <p><strong>Clinic Address:</strong> ${doctorClinicAddress}</p>
            `;

                // Send email to admin
                await sendEmail({
                    to: adminUser.email,
                    subject,
                    html,
                    from: '"Clinic Portal" <no-reply@yourapp.com>', // Need to change for production
                });

                return res.status(200).json({
                    success: true,
                    message: "Doctor registered successfully. Admin notified by email.",
                });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
            }
        },
    },

    // Get a doctor profile by ID
    doctorProfile: {
        validation: Joi.object({
            userId: Joi.string().required().messages({
                "string.base": "Doctor name must be a string.",
                "string.empty": "Doctor name is required.",
                "any.required": "Doctor name is required.",
            }),
        }),

        handler: async (req, res) => {
            try {
                const {
                    userId,
                } = req.params;

                const doctor = await Doctor.findOne({
                    where: { user_id: userId },
                    raw: true,
                });

                if (!doctor) return res.status(404).json({ message: "User not found" });

                const userDetails = await User.findOne({
                    where: { id: userId },
                    attributes: ["name", "email", "mobile_no"],
                    raw: true,
                });

                // Destructure to remove createdAt and updatedAt
                const { createdAt, updatedAt, ...filteredDoctor } = doctor;

                const mergedProfile = {
                    ...userDetails,
                    ...filteredDoctor,
                };

                return res.status(200).json({
                    success: true,
                    message: "Doctor profile fetched successfully.",
                    data: mergedProfile
                });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Server error" });
            }
        },
    },

    // Edit doctor profile by ID (PATCH)
    editDoctorProfile: {
        validation: Joi.object({
            name: Joi.string().optional(),
            email: Joi.string().email().optional(),
            mobile_no: Joi.string().pattern(/^[1-9][0-9]{9}$/).optional(),
            specialization: Joi.string().optional(),
            age: Joi.number().integer().min(18).optional(),
            gender: Joi.string().valid("Male", "Female", "Other").optional(),
            about: Joi.string().optional(),
            appointmentFee: Joi.number().min(0).optional()
        }),

        handler: async (req, res) => {
            try {
                const { userId } = req.params;
                const {
                    name,
                    email,
                    mobile_no,
                    specialization,
                    age,
                    gender,
                    about,
                    appointmentFee
                } = req.body;

                const user = await User.findByPk(userId);
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }

                const userUpdateFields = {};
                if (name !== undefined) userUpdateFields.name = name;
                if (email !== undefined) userUpdateFields.email = email;
                if (mobile_no !== undefined) userUpdateFields.mobile_no = mobile_no;

                if (Object.keys(userUpdateFields).length > 0) {
                    const [userUpdated] = await User.update(userUpdateFields, {
                        where: { id: userId },
                    });
                    console.log("User update result:", userUpdated);
                }

                const doctorUpdateFields = {};
                if (specialization !== undefined) doctorUpdateFields.specialization = specialization;
                if (age !== undefined) doctorUpdateFields.age = age;
                if (gender !== undefined) doctorUpdateFields.gender = gender;
                if (about !== undefined) doctorUpdateFields.about = about;
                if (appointmentFee !== undefined) doctorUpdateFields.appointmentFee = appointmentFee;

                if (Object.keys(doctorUpdateFields).length > 0) {
                    const [doctorUpdated] = await Doctor.update(doctorUpdateFields, {
                        where: { user_id: userId },
                    });
                    console.log("Doctor update result:", doctorUpdated);
                }

                return res.status(200).json({
                    success: true,
                    message: "Doctor profile updated successfully.",
                });

            } catch (error) {
                console.error("Update error:", error);
                return res.status(500).json({ message: "Server error" });
            }
        }
    },

    doctorAppointmentSummary: {
        validation: Joi.object({
            userId: Joi.string().required().messages({
                "string.base": "Doctor name must be a string.",
                "string.empty": "Doctor name is required.",
                "any.required": "Doctor name is required.",
            }),
        }),

        handler: async (req, res) => {
            try {
                const doctorId = req.params.userId;

                const today = moment();
                const todayDateOnly = today.format("YYYY-MM-DD");

                // ---------------------------
                // 1. Appointments Summary
                // ---------------------------
                const [totalAppointments, upcoming, completed, cancelled] = await Promise.all([
                    Appointment.count({ where: { doctor_id: doctorId } }),
                    Appointment.count({
                        where: {
                            doctor_id: doctorId,
                            date: todayDateOnly,
                            status: "scheduled",
                        },
                    }),
                    Appointment.count({
                        where: { doctor_id: doctorId, status: "completed" },
                    }),
                    Appointment.count({
                        where: { doctor_id: doctorId, status: "cancelled" },
                    }),
                ]);

                // ---------------------------
                // 2. Appointment Trend (Last 7 days)
                // ---------------------------
                const startDate = moment().subtract(6, "days").startOf("day");
                const endDate = today.clone().startOf("day");

                const trendData = await Appointment.findAll({
                    attributes: [
                        [Sequelize.fn("DATE", Sequelize.col("date")), "date"],
                        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
                    ],
                    where: {
                        doctor_id: doctorId,
                        date: {
                            [Op.between]: [startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD")],
                        },
                    },
                    group: [Sequelize.fn("DATE", Sequelize.col("date"))],
                    order: [[Sequelize.fn("DATE", Sequelize.col("date")), "ASC"]],
                });

                const formattedTrend = [];
                for (let i = 0; i < 7; i++) {
                    const day = startDate.clone().add(i, "days").format("YYYY-MM-DD");
                    const entry = trendData.find(item => item.get("date") === day);
                    formattedTrend.push({
                        date: day,
                        count: entry ? parseInt(entry.get("count")) : 0,
                    });
                }

                // ---------------------------
                // 3. Monthly Earnings Summary
                // ---------------------------
                const currentYear = today.year();
                const yearStart = moment(`${currentYear}-01-01`).startOf("day");
                const yearEnd = moment(`${currentYear}-12-31`).endOf("day");

                const earnings = await Payment.findAll({
                    attributes: [
                        [Sequelize.literal(`EXTRACT(MONTH FROM "createdAt")`), "month"],
                        [Sequelize.fn("SUM", Sequelize.col("amount")), "total"],
                    ],
                    where: {
                        user_id: doctorId,
                        payableType: "APPOINTMENT",
                        status: "PAID",
                        createdAt: {
                            [Op.gte]: yearStart.toDate(),
                            [Op.lte]: yearEnd.toDate(),
                        },
                    },
                    group: [Sequelize.literal(`EXTRACT(MONTH FROM "createdAt")`)],
                });

                const currentMonth = today.month(); // 0 = Jan
                const earningsSummary = Array.from({ length: currentMonth + 1 }, (_, index) => {
                    const entry = earnings.find(e => parseInt(e.get("month")) === index + 1);
                    const monthLabel = moment().month(index).year(currentYear).format("MMMM YYYY");
                    return {
                        month: monthLabel,
                        total: entry ? parseInt(entry.get("total")) : 0,
                    };
                });

                // ---------------------------
                // Final Response
                // ---------------------------
                return res.status(200).json({
                    success: true,
                    data: {
                        appointmentsSummary: {
                            total: totalAppointments,
                            upcoming,
                            completed,
                            cancelled,
                        },
                        appointmentTrend: formattedTrend,
                        earningsSummary,
                    },
                });
            } catch (error) {
                console.error("Dashboard Summary Error:", error);
                return res.status(500).json({ success: false, message: "Server Error" });
            }
        },
    },

    doctorAppointment: {
        validation: Joi.object({
            search: Joi.string().optional().label("Search term"),
            date: Joi.date().iso().optional().label("Date"),
            status: Joi.string().valid("scheduled", "cancelled", "completed").optional().label("Appointment status"),
            paymentStatus: Joi.string().valid("PAID", "REFUNDED", "Pay Later").optional().label("Payment status"),
            page: Joi.number().integer().min(1).default(1).label("Page number"),
            limit: Joi.number().integer().min(1).max(100).default(10).label("Items per page"),
        }),
        handler: async (req, res) => {
            try {
                const {
                    search = "",
                    date,
                    status,
                    paymentStatus,
                    page = 1,
                    limit = 10,
                } = req.query;

                const { userId } = req.params;
                const offset = (page - 1) * limit;

                // Step 1: Build appointment where clause
                const appointmentWhere = { doctor_id: userId };
                if (status) appointmentWhere.status = status;
                if (date) appointmentWhere.date = date;

                // Step 2: Fetch appointments
                const appointments = await Appointment.findAll({
                    where: appointmentWhere,
                    order: [["date", "DESC"], ["time", "DESC"]],
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                });

                // Step 3: Get patient IDs and appointment IDs
                const patientIds = appointments.map(a => a.patient_id);
                const appointmentIds = appointments.map(a => a.id);

                // Step 4: Fetch patients
                const patientWhere = search
                    ? { id: { [Op.in]: patientIds }, name: { [Op.iLike]: `%${search}%` } }
                    : { id: { [Op.in]: patientIds } };

                const patients = await User.findAll({
                    where: patientWhere,
                    attributes: ["id", "name", "email", "mobile_no"],
                });

                const patientMap = {};
                patients.forEach(p => {
                    patientMap[p.id] = p;
                });

                // Step 5: Fetch payments
                const paymentWhere = {
                    payableType: "APPOINTMENT",
                    payableId: { [Op.in]: appointmentIds },
                };
                if (paymentStatus && paymentStatus !== "Pay Later") {
                    paymentWhere.status = paymentStatus;
                }

                const payments = await Payment.findAll({
                    where: paymentWhere,
                    attributes: ["payableId", "status", "amount"],
                });

                const paymentMap = {};
                payments.forEach(p => {
                    paymentMap[p.payableId] = p;
                });

                // Step 6: Filter by Pay Later if needed
                let filteredAppointments = appointments;
                if (paymentStatus === "Pay Later") {
                    filteredAppointments = appointments.filter(app => !paymentMap[app.id]);
                }

                // Step 7: Prepare response data
                const data = filteredAppointments.map(app => {
                    const patient = patientMap[app.patient_id];
                    const payment = paymentMap[app.id];
                    return {
                        id: app.id,
                        appId: "A" + app.id.slice(0, 5).toUpperCase(),
                        patientName: patient?.name || "-",
                        patientEmail: patient?.email || "-",
                        patientMobile: patient?.mobile_no || "-",
                        date: moment(app.date).format("D MMMM YYYY"), // "12 April 2025"
                        time: moment(app.time, "HH:mm:ss").format("hh:mm A"), // "10:00 AM"
                        status: app.status,
                        paymentStatus: payment?.status || "Pay Later",
                        amount: payment?.amount || 0,
                    };
                });

                // Step 8: Get total count (without pagination)
                const total = await Appointment.count({ where: appointmentWhere });

                return res.status(200).json({
                    success: true,
                    data,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit),
                    },
                });
            } catch (error) {
                console.error("Error fetching appointments:", error);
                res.status(500).json({ success: false, message: "Server Error" });
            }
        }
    },

    doctorPaymentSummary: {
        validation: Joi.object({
            userId: Joi.string().required().messages({
                "string.base": "Doctor name must be a string.",
                "string.empty": "Doctor name is required.",
                "any.required": "Doctor name is required.",
            }),
        }),
        handler: async (req, res) => {
            try {
                const userId = req.params.userId;

                // Total Earnings (PAID)
                const totalEarnings = await Payment.count({
                    where: {
                        user_id: userId,
                        status: "PAID",
                        payableType: "APPOINTMENT",
                    },
                });

                // Pending Amount (PENDING)
                const pendingAmount = await Payment.count({
                    where: {
                        user_id: userId,
                        status: "PENDING",
                        payableType: "APPOINTMENT",
                    },
                });

                // Total Transactions (ALL)
                const totalTransactions = await Payment.count({
                    where: {
                        user_id: userId,
                        payableType: "APPOINTMENT",
                    },
                });

                // Monthly Payment Analytics for PAID Payments
                const monthlyPayments = await Payment.findAll({
                    attributes: [
                        [Sequelize.literal(`EXTRACT(MONTH FROM "createdAt")`), "month"],
                        [Sequelize.fn("SUM", Sequelize.col("amount")), "total"],
                    ],
                    where: {
                        user_id: userId,
                        status: "PAID",
                        payableType: "APPOINTMENT",
                        createdAt: {
                            [Op.between]: [
                                moment().startOf("year").toDate(),
                                moment().endOf("year").toDate(),
                            ],
                        },
                    },
                    group: [Sequelize.literal(`EXTRACT(MONTH FROM "createdAt")`)],
                    order: [[Sequelize.literal(`EXTRACT(MONTH FROM "createdAt")`), "ASC"]],
                });

                const currentMonthIndex = moment().month(); // 0-based (0 = Jan)

                const earningsSummary = Array.from({ length: currentMonthIndex + 1 }, (_, index) => {
                    const entry = monthlyPayments.find(e => parseInt(e.get("month")) === index + 1);
                    return {
                        month: moment().month(index).format("MMM"), // Jan, Feb, ...
                        total: entry ? parseInt(entry.get("total")) : 0,
                    };
                });


                return res.status(200).json({
                    success: true,
                    data: {
                        totalEarnings: totalEarnings || 0,
                        pendingAmount: pendingAmount || 0,
                        totalTransactions: totalTransactions || 0,
                        analytics: earningsSummary,
                    },
                });

            } catch (error) {
                console.error("Error fetching payment history:", error);
                res.status(500).json({ success: false, message: "Server Error" });
            }
        }
    },

    doctorPaymentHistory: {
        validation: Joi.object({
            search: Joi.string().optional().label("Search term"),
            status: Joi.string()
                .valid("scheduled", "cancelled", "completed", "all")
                .optional()
                .label("Appointment Status"),
            paymentStatus: Joi.string()
                .valid("PENDING", "PAID", "REFUNDED", "FAILED", "all")
                .optional()
                .label("Payment Status"),
            page: Joi.number().integer().min(1).default(1).label("Page number"),
            limit: Joi.number().integer().min(1).max(50).default(10).label("Items per page"),
        }),

        handler: async (req, res) => {
            try {
                const doctorId = req.params.userId;
                const { search = "", status, paymentStatus, page = 1, limit = 10 } = req.query;
                const offset = (page - 1) * limit;

                // Step 1: Get all appointment IDs for the doctor
                const appointments = await Appointment.findAll({
                    where: {
                        doctor_id: doctorId,
                        ...(status && status !== "all" ? { status } : {}),
                    },
                    attributes: ["id", "patient_id", "date", "time", "status"],
                    include: [
                        {
                            model: User,
                            as: "patient",
                            attributes: ["id", "name", "email"],
                            where: search ? { name: { [Op.iLike]: `%${search}%` } } : undefined,
                            required: search ? true : false,
                        },
                    ],
                });

                const appointmentMap = {};
                const appointmentIds = appointments.map((a) => {
                    appointmentMap[a.id] = a;
                    return a.id;
                });

                // Step 2: Get all payments with payableId in the above appointment list
                const { rows: payments, count } = await Payment.findAndCountAll({
                    where: {
                        user_id: doctorId,
                        payableType: "APPOINTMENT",
                        payableId: appointmentIds,
                        ...(paymentStatus && paymentStatus !== "all" ? { status: paymentStatus } : {}),
                    },
                    order: [["createdAt", "DESC"]],
                    offset: parseInt(offset),
                    limit: parseInt(limit),
                });

                // Step 3: Format Response
                const data = payments.map((payment) => {
                    const appointment = appointmentMap[payment.payableId];
                    const patient = appointment?.patient;
                    return {
                        id: payment.id,
                        appId: "A" + appointment.id.slice(0, 5).toUpperCase(),
                        patientName: patient?.name,
                        patientEmail: patient?.email,
                        date: moment(appointment.date).format("Do MMMM"),
                        time: moment(appointment.time, "HH:mm:ss").format("hh:mm A"),
                        status: appointment.status,
                        paymentStatus: payment.status,
                        amount: payment.amount || 0,
                        mode: payment.paymentMethod || "-",
                    };
                });

                return res.status(200).json({
                    success: true,
                    data,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: count,
                        pages: Math.ceil(count / limit),
                    },
                });
            } catch (error) {
                console.error("Transaction history fetch error:", error);
                return res.status(500).json({ success: false, message: "Server Error" });
            }
        },
    },

    doctorAppointmentReschedule: {
        validation: Joi.object({
            appointmentId: Joi.string().uuid().required().messages({
                "string.base": "Appointment ID must be a string.",
                "string.uuid": "Appointment ID must be a valid UUID.",
                "any.required": "Appointment ID is required.",
            }),
            date: Joi.string().isoDate().required().messages({
                "string.base": "Date must be a string.",
                "string.isoDate": "Date must be in ISO format (YYYY-MM-DD).",
                "any.required": "Date is required.",
            }),
            time: Joi.string().pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/).required().messages({
                "string.base": "Time must be a string.",
                "string.pattern.base": "Time must be in HH:MM (24-hour) format.",
                "any.required": "Time is required.",
            }),
        }),

        handler: async (req, res) => {
            try {
                const { userId } = req.params;
                // Manually validate userId
                const userIdValidation = Joi.string().uuid().required().validate(userId);
                if (userIdValidation.error) {
                    return res.status(400).json({
                        message: "Validation Error",
                        errors: [userIdValidation.error.message],
                    });
                }
                const { appointmentId, date, time } = req.body;

                // Find and update the appointment
                const [updatedRows] = await Appointment.update(
                    { date, time },
                    {
                        where: {
                            id: appointmentId,
                            doctor_id: userId,
                        },
                    }
                );

                if (updatedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Appointment not found or you are not authorized to update it.",
                    });
                }

                res.status(200).json({
                    success: true,
                    message: "Appointment rescheduled successfully.",
                });
            } catch (error) {
                console.error("Error rescheduling appointment:", error);
                res.status(500).json({
                    success: false,
                    message: "Server error while rescheduling appointment.",
                });
            }
        },
    }
};

module.exports = doctorController;