const { Op } = require('sequelize');

const User = require('../../../models/user');
const Clinic = require('../../../models/clinic');
const Appointment = require('../../../models/appointment');
const Payment = require('../../../models/payment');
const Subscription = require('../../../models/subscription');
const sequelize = require('../../../config/db');
const Plan = require('../../../models/plan');

const getStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // === CURRENT MONTH ===
        const currentUsers = await User.count({ where: { createdAt: { [Op.gte]: startOfMonth } } });
        const currentDoctors = await User.count({ where: { role_id: process.env.DOCTOR_ROLE_ID, createdAt: { [Op.gte]: startOfMonth } } });
        const currentClinics = await User.count({ where: { role_id: process.env.CLINIC_ROLE_ID, createdAt: { [Op.gte]: startOfMonth } } });
        const currentAppointments = await Appointment.count({ where: { createdAt: { [Op.gte]: startOfMonth } } });

        // === LAST MONTH ===
        const lastUsers = await User.count({ where: { createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] } } });
        const lastDoctors = await User.count({ where: { role_id: process.env.DOCTOR_ROLE_ID, createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] } } });
        const lastClinics = await User.count({ where: { role_id: process.env.CLINIC_ROLE_ID, createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] } } });
        const lastAppointments = await Appointment.count({ where: { createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] } } });

        // === TOTAL ===
        const totalUsers = await User.count();
        const totalDoctors = await User.count({ where: { role_id: process.env.DOCTOR_ROLE_ID } });
        const totalClinics = await User.count({ where: { role_id: process.env.CLINIC_ROLE_ID } });
        const totalAppointments = await Appointment.count();

        const getPercentage = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous * 100).toFixed(2);
        };

        res.json({
            users: {
                total: totalUsers,
                monthlyChange: getPercentage(currentUsers, lastUsers),
            },
            doctors: {
                total: totalDoctors,
                monthlyChange: getPercentage(currentDoctors, lastDoctors),
            },
            clinics: {
                total: totalClinics,
                monthlyChange: getPercentage(currentClinics, lastClinics),
            },
            appointments: {
                total: totalAppointments,
                monthlyChange: getPercentage(currentAppointments, lastAppointments),
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getEarningsStats = async (req, res) => {
    try {
        const { date } = req.query;

        const specificDay = new Date(date);

        // Get start and end of today (in local time)
        const startOfToday = new Date(
            specificDay.getFullYear(),
            specificDay.getMonth(),
            specificDay.getDate(),
            0, 0, 0, 0
        );

        const endOfToday = new Date(
            specificDay.getFullYear(),
            specificDay.getMonth(),
            specificDay.getDate(),
            23, 59, 59, 999
        );

        // Get previous day
        const prevDay = new Date(specificDay);
        prevDay.setDate(prevDay.getDate() - 1);

        const startOfYesterday = new Date(
            prevDay.getFullYear(),
            prevDay.getMonth(),
            prevDay.getDate(),
            0, 0, 0, 0
        );

        const endOfYesterday = new Date(
            prevDay.getFullYear(),
            prevDay.getMonth(),
            prevDay.getDate(),
            23, 59, 59, 999
        );

        const getPercentage = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous * 100).toFixed(2);
        };

        // Now use in your query:
        const [paidThisDay, pendingThisDay, paidLastDay, pendingLastDay] = await Promise.all([
            Payment.findAll({
                where: {
                    status: 'PAID',
                    createdAt: {
                        [Op.between]: [startOfToday, endOfToday]
                    }
                }
            }),
            Payment.findAll({
                where: {
                    status: 'PENDING',
                    createdAt: {
                        [Op.between]: [startOfToday, endOfToday]
                    }
                }
            }),
            Payment.findAll({
                where: {
                    status: 'PAID',
                    createdAt: {
                        [Op.between]: [startOfYesterday, endOfYesterday]
                    }
                }
            }),
            Payment.findAll({
                where: {
                    status: 'PENDING',
                    createdAt: {
                        [Op.between]: [startOfYesterday, endOfYesterday]
                    }
                }
            })
        ]);

        const currentEarnings = paidThisDay.reduce((sum, p) => sum + (p.amount || 0), 0);
        const lastDayEarnings = paidLastDay.reduce((sum, p) => sum + (p.amount || 0), 0);
        const pendingPayments = pendingThisDay.reduce((sum, p) => sum + (p.amount || 0), 0);
        const lastDayPending = pendingLastDay.reduce((sum, p) => sum + (p.amount || 0), 0);

        return res.status(200).json({
            success: true, data: {
                earnings: {
                    totalEarnings: currentEarnings,
                    totalEarningsChange: getPercentage(currentEarnings, lastDayEarnings),
                    pendingPayments,
                    pendingPaymentsChange: getPercentage(pendingPayments, lastDayPending)
                },
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: 'Failed to fetch earnings data' });
    }
};

const getSubscriptionStats = async (req, res) => {
    try {
        const { date } = req.query;

        const specificDay = new Date(date);

        // Get start and end of today (in local time)
        const startOfToday = new Date(
            specificDay.getFullYear(),
            specificDay.getMonth(),
            specificDay.getDate(),
            0, 0, 0, 0
        );

        const endOfToday = new Date(
            specificDay.getFullYear(),
            specificDay.getMonth(),
            specificDay.getDate(),
            23, 59, 59, 999
        );

        // Get previous day
        const prevDay = new Date(specificDay);
        prevDay.setDate(prevDay.getDate() - 1);

        const startOfYesterday = new Date(
            prevDay.getFullYear(),
            prevDay.getMonth(),
            prevDay.getDate(),
            0, 0, 0, 0
        );

        const endOfYesterday = new Date(
            prevDay.getFullYear(),
            prevDay.getMonth(),
            prevDay.getDate(),
            23, 59, 59, 999
        );

        const getPercentage = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous * 100).toFixed(2);
        };

        const [baseThisDay, baseLastDay, proThisDay, proLastDay] = await Promise.all([
            Subscription.count({
                where: {
                    plan_id: { [Op.in]: [process.env.DOCTOR_BASE_PLAN_ID, process.env.CLINIC_BASE_PLAN_ID] },
                    createdAt: { [Op.between]: [startOfToday, endOfToday] }
                }
            }),
            Subscription.count({
                where: {
                    plan_id: { [Op.in]: [process.env.DOCTOR_BASE_PLAN_ID, process.env.CLINIC_BASE_PLAN_ID] },
                    createdAt: { [Op.between]: [startOfYesterday, endOfYesterday] }
                }
            }),
            Subscription.count({
                where: {
                    plan_id: { [Op.in]: [process.env.DOCTOR_PRO_PLAN_ID, process.env.CLINIC_PRO_PLAN_ID] },
                    createdAt: { [Op.between]: [startOfToday, endOfToday] }
                }
            }),
            Subscription.count({
                where: {
                    plan_id: { [Op.in]: [process.env.DOCTOR_PRO_PLAN_ID, process.env.CLINIC_PRO_PLAN_ID] },
                    createdAt: { [Op.between]: [startOfYesterday, endOfYesterday] }
                }
            })
        ]);

        return res.status(200).json({
            success: true,
            data: {
                subscriptions: {
                    base: {
                        thisDay: baseThisDay,
                        lastDay: baseLastDay,
                        percentageChange: getPercentage(baseThisDay, baseLastDay)
                    },
                    pro: {
                        thisDay: proThisDay,
                        lastDay: proLastDay,
                        percentageChange: getPercentage(proThisDay, proLastDay)
                    }
                },
            }
        });

    } catch (error) {
        console.error("Subscription Stats Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const getRecentActivities = async (req, res) => {
    try {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - 7); // last 7 days

        // Get recent users
        const recentUsers = await User.findAll({
            where: {
                createdAt: { [Op.gte]: daysAgo },
                role_id: process.env.PATIENT_ROLE_ID,
            },
            order: [['createdAt', 'DESC']],
            limit: 10,
        });

        // Get recent doctors
        const recentDoctors = await User.findAll({
            where: {
                createdAt: { [Op.gte]: daysAgo },
                role_id: process.env.DOCTOR__ROLE_ID,
            },
            order: [['createdAt', 'DESC']],
            limit: 10,
        });

        // Get recent clinics
        const recentClinics = await User.findAll({
            where: {
                createdAt: { [Op.gte]: daysAgo },
                role_id: process.env.CLINIC_ROLE_ID,
            },
            order: [['createdAt', 'DESC']],
            limit: 10,
        });

        // Get recent appointments
        const recentAppointments = await Appointment.findAll({
            where: { createdAt: { [Op.gte]: daysAgo } },
            order: [['createdAt', 'DESC']],
            limit: 10,
        });

        return res.status(200).json({
            recentUsers,
            recentDoctors,
            recentClinics,
            recentAppointments,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const specificDay = new Date();

        // Get start and end of today (in local time)
        const startOfToday = new Date(
            specificDay.getFullYear(),
            specificDay.getMonth(),
            specificDay.getDate(),
            0, 0, 0, 0
        );

        const endOfToday = new Date(
            specificDay.getFullYear(),
            specificDay.getMonth(),
            specificDay.getDate(),
            23, 59, 59, 999
        );

        // Get previous day
        const prevDay = new Date(specificDay);
        prevDay.setDate(prevDay.getDate() - 1);

        const startOfYesterday = new Date(
            prevDay.getFullYear(),
            prevDay.getMonth(),
            prevDay.getDate(),
            0, 0, 0, 0
        );

        const endOfYesterday = new Date(
            prevDay.getFullYear(),
            prevDay.getMonth(),
            prevDay.getDate(),
            23, 59, 59, 999
        );

        const getPercentage = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous * 100).toFixed(2);
        };

        // === CURRENT DAY ===
        const [currentUsers, currentDoctors, currentClinics, currentAppointments] = await Promise.all([
            User.count({ where: { createdAt: { [Op.gte]: startOfMonth } } }),
            User.count({ where: { role_id: process.env.DOCTOR_ROLE_ID, createdAt: { [Op.gte]: startOfMonth } } }),
            User.count({ where: { role_id: process.env.CLINIC_ROLE_ID, createdAt: { [Op.gte]: startOfMonth } } }),
            Appointment.count({ where: { createdAt: { [Op.gte]: startOfMonth } } })
        ]);

        // === LAST DAY ===
        const [lastUsers, lastDoctors, lastClinics, lastAppointments] = await Promise.all([
            User.count({ where: { createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] } } }),
            User.count({ where: { role_id: process.env.DOCTOR_ROLE_ID, createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] } } }),
            User.count({ where: { role_id: process.env.CLINIC_ROLE_ID, createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] } } }),
            Appointment.count({ where: { createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] } } })
        ]);

        // === TOTAL ===
        // const [totalUsers, totalDoctors, totalClinics, totalAppointments] = await Promise.all([
        //     User.count({ where: { createdAt: { [Op.gte]: startOfMonth } } }),
        //     User.count({ where: { role_id: process.env.DOCTOR_ROLE_ID }, createdAt: { [Op.gte]: startOfMonth } }),
        //     User.count({ where: { role_id: process.env.CLINIC_ROLE_ID }, createdAt: { [Op.gte]: startOfMonth } }),
        //     Appointment.count({ where: { createdAt: { [Op.gte]: startOfMonth } } })
        // ]);

        // === EARNINGS ===
        const [paidThisDay, pendingThisDay, paidLastDay, pendingLastDay] = await Promise.all([
            Payment.findAll({ where: { status: 'PAID', createdAt: { [Op.between]: [startOfToday, endOfToday] } } }),
            Payment.findAll({ where: { status: 'PENDING', createdAt: { [Op.between]: [startOfToday, endOfToday] } } }),
            Payment.findAll({ where: { status: 'PAID', createdAt: { [Op.between]: [startOfYesterday, endOfYesterday] } } }),
            Payment.findAll({ where: { status: 'PENDING', createdAt: { [Op.between]: [startOfYesterday, endOfYesterday] } } })
        ]);

        const currentEarnings = paidThisDay.reduce((sum, p) => sum + (p.amount || 0), 0);
        const lastDayEarnings = paidLastDay.reduce((sum, p) => sum + (p.amount || 0), 0);
        const pendingPayments = pendingThisDay.reduce((sum, p) => sum + (p.amount || 0), 0);
        const lastDayPending = pendingLastDay.reduce((sum, p) => sum + (p.amount || 0), 0);

        // === SUBSCRIPTIONS ===
        const [baseThisDay, baseLastDay, proThisDay, proLastDay] = await Promise.all([
            Subscription.count({
                where: {
                    plan_id: { [Op.in]: [process.env.DOCTOR_BASE_PLAN_ID, process.env.CLINIC_BASE_PLAN_ID] },
                    createdAt: { [Op.between]: [startOfToday, endOfToday] }
                }
            }),
            Subscription.count({
                where: {
                    plan_id: { [Op.in]: [process.env.DOCTOR_BASE_PLAN_ID, process.env.CLINIC_BASE_PLAN_ID] },
                    createdAt: { [Op.between]: [startOfYesterday, endOfYesterday] }
                }
            }),
            Subscription.count({
                where: {
                    plan_id: { [Op.in]: [process.env.DOCTOR_PRO_PLAN_ID, process.env.CLINIC_PRO_PLAN_ID] },
                    createdAt: { [Op.between]: [startOfToday, endOfToday] }
                }
            }),
            Subscription.count({
                where: {
                    plan_id: { [Op.in]: [process.env.DOCTOR_PRO_PLAN_ID, process.env.CLINIC_PRO_PLAN_ID] },
                    createdAt: { [Op.between]: [startOfYesterday, endOfYesterday] }
                }
            })
        ]);

        // === RECENT ACTIVITIES ===
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - 1);

        const [recentUsers, recentDoctors, recentClinics, recentAppointments, recentSubscriptions] = await Promise.all([
            User.findAll({
                where: { createdAt: { [Op.gte]: daysAgo }, role_id: process.env.PATIENT_ROLE_ID },
                order: [['createdAt', 'DESC']], limit: 10
            }),
            User.findAll({
                where: { createdAt: { [Op.gte]: daysAgo }, role_id: process.env.DOCTOR_ROLE_ID },
                order: [['createdAt', 'DESC']], limit: 10
            }),
            User.findAll({
                where: { createdAt: { [Op.gte]: daysAgo }, role_id: process.env.CLINIC_ROLE_ID },
                order: [['createdAt', 'DESC']], limit: 10
            }),
            Appointment.findAll({
                where: { createdAt: { [Op.gte]: daysAgo } },
                order: [['createdAt', 'DESC']], limit: 10
            }),
            Subscription.findAll({
                where: { createdAt: { [Op.gte]: daysAgo } },
                include: [{ model: User, attributes: ['name'], as: "subscribedFor" }],
                order: [['createdAt', 'DESC']],
                limit: 10
            })
        ]);

        // Map recent activities to desired format
        const mapActivities = (items, activityName) => {
            return items?.map(item => ({
                activity: activityName,
                user: item.name || item.User?.name || item.subscribedFor?.name || 'Unknown',
                time: item.createdAt
            })) || [];
        };

        const recentActivities = [
            ...mapActivities(recentUsers, 'User Registration'),
            ...mapActivities(recentDoctors, 'Doctor Registration'),
            ...mapActivities(recentClinics, 'Clinic Registration'),
            ...mapActivities(recentAppointments, 'Appointment'),
            ...mapActivities(recentSubscriptions, 'Subscription')
        ];

        // === FINAL RESPONSE ===
        res.status(200).json({
            success: true,
            message: "Dashboard stats fetched successfully",
            data: {
                stats: {
                    users: {
                        total: currentUsers,
                        monthlyChange: getPercentage(currentUsers, lastUsers)
                    },
                    doctors: {
                        total: currentDoctors,
                        monthlyChange: getPercentage(currentDoctors, lastDoctors)
                    },
                    clinics: {
                        total: currentClinics,
                        monthlyChange: getPercentage(currentClinics, lastClinics)
                    },
                    appointments: {
                        total: currentAppointments,
                        monthlyChange: getPercentage(currentAppointments, lastAppointments)
                    }
                },
                earnings: {
                    totalEarnings: currentEarnings,
                    totalEarningsChange: getPercentage(currentEarnings, lastDayEarnings),
                    pendingPayments,
                    pendingPaymentsChange: getPercentage(pendingPayments, lastDayPending)
                },
                subscriptions: {
                    base: {
                        thisDay: baseThisDay,
                        lastDay: baseLastDay,
                        percentageChange: getPercentage(baseThisDay, baseLastDay)
                    },
                    pro: {
                        thisDay: proThisDay,
                        lastDay: proLastDay,
                        percentageChange: getPercentage(proThisDay, proLastDay)
                    }
                },
                recentActivities
            },
            error: null
        });

    } catch (err) {
        console.error("Dashboard Stats Error:", err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getReportStats = async (req, res) => {
    try {
        const totalRevenue = await Payment.sum('amount', {
            // where: { status: 'PAID' }
        });

        const subscriptionBreakdown = await Subscription.findAll({
            attributes: [
                [sequelize.col('Plan.name'), 'name'],
                [sequelize.fn('COUNT', sequelize.col('Subscription.id')), 'count']
            ],
            include: [{
                model: Plan,
                attributes: [],
            }],
            group: ['Plan.name'],
            raw: true
        });

        const topDoctors = await Appointment.findAll({
            attributes: [
                ['doctor_id', 'id'],
                [sequelize.fn('COUNT', sequelize.col('doctor_id')), 'appointments']
            ],
            group: ['doctor_id'],
            order: [[sequelize.fn('COUNT', sequelize.col('doctor_id')), 'DESC']],
            limit: 5,
            raw: true
        });


        const topClinics = await Appointment.findAll({
            attributes: [
                ['clinic_id', 'id'],
                [sequelize.fn('COUNT', sequelize.col('clinic_id')), 'appointments']
            ],
            group: ['clinic_id'],
            order: [[sequelize.fn('COUNT', sequelize.col('clinic_id')), 'DESC']],
            limit: 5,
            raw: true
        });


        const monthWiseRevenue = await Payment.findAll({
            attributes: [
                [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'month'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'total']
            ],
            where: { status: 'PAID' },
            group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'))],
            order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']],
            raw: true
        });

        res.status(200).json({
            success: true,
            message: "Dashboard stats fetched successfully",
            data: {
                totalRevenue,
                subscriptionBreakdown,
                topDoctors,
                topClinics,
                monthWiseRevenue
            },
            error: null
        });

    } catch (error) {
        console.error("Rports Stats Error:", error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = { getStats, getRecentActivities, getEarningsStats, getSubscriptionStats, getDashboardStats, getReportStats };