const express = require("express");

const { createAppointment, getAppointment, getAppointmentById, updateAppointment, deleteAppointment, getAppointmentDashboardStat, verifyAppointment } = require("../controllers/appointmentController");
const validate = require("../../../middleware/validateMiddleware");
const { authMiddleware, roleMiddleware } = require("../../../middleware/authMiddleware");

const router = express.Router();

// Create a new appointment
router.post("/create", validate("body", createAppointment.validation), createAppointment.handler);
router.post("/verify/payment", validate("body", verifyAppointment.validation), verifyAppointment.handler);
router.get("/dashboard-stat", getAppointmentDashboardStat.handler);

module.exports = router;