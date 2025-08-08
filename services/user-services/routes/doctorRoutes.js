const express = require("express");
const multer = require("multer");

const { createDoctor, getDoctors, getDoctorById, updateDoctor, deleteDoctor, getAssignedDoctors, assignDoctor, dischargeDoctor, registerDoctor, doctorProfile, editDoctorProfile, doctorAppointmentSummary, doctorAppointment, doctorPaymentSummary, doctorPaymentHistory, doctorAppointmentReschedule } = require("../controllers/doctorController");
const validate = require("../../../middleware/validateMiddleware");
const { authMiddleware, roleMiddleware } = require("../../../middleware/authMiddleware");
const { storage } = require('../../../config/cloudinary.js');

const upload = multer({ storage });

const router = express.Router();

// Create a new doctor
router.post("/create", authMiddleware, upload.single('photo'), validate("body", createDoctor.validation), createDoctor.handler);

// Get all doctors
router.get("/get", getDoctors.handler);

// Get assigned doctors
router.get("/get-assign/:id", getAssignedDoctors.handler);

// assigned doctors
router.patch("/assign", assignDoctor.handler);

// discharge doctors
router.patch("/discharge", dischargeDoctor.handler);

// Get a specific doctor by ID
router.get("/:id", validate("params", getDoctorById.validation), getDoctorById.handler);

// Update a doctor
router.put("/update", upload.single("photo"), validate("body", updateDoctor.validation), authMiddleware, updateDoctor.handler);

// Delete a doctor
router.delete("/delete/:id", validate("params", deleteDoctor.validation), authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID]), deleteDoctor.handler);

// Register a doctor
router.post(
    "/register",
    validate("body", registerDoctor.validation),
    registerDoctor.handler
);

// Get doctor profile by id
router.get(
    "/profile/:userId",
    authMiddleware,
    validate("params", doctorProfile.validation),
    doctorProfile.handler
);

// Update doctor profile by id
router.patch(
    "/profile/:userId",
    authMiddleware,
    validate("body", editDoctorProfile.validation),
    editDoctorProfile.handler
);

// Get doctor appointment summary by id
router.get(
    "/dashboard/summary/:userId",
    authMiddleware,
    validate("params", doctorAppointmentSummary.validation),
    doctorAppointmentSummary.handler
);

// Get doctor appointments
router.get(
    "/appointments/:userId",
    authMiddleware,
    validate("query", doctorAppointment.validation),
    doctorAppointment.handler
);

// Get doctor payment summary by id
router.get(
    "/payment/summary/:userId",
    authMiddleware,
    validate("params", doctorPaymentSummary.validation),
    doctorPaymentSummary.handler
);

// Get doctor payment history by id
router.get(
    "/payment/history/:userId",
    authMiddleware,
    validate("query", doctorPaymentHistory.validation),
    doctorPaymentHistory.handler
);

// Reschedule an appointment
router.patch(
    "/appointment/reschedule/:userId",
    // authMiddleware,
    validate("body", doctorAppointmentReschedule.validation),
    doctorAppointmentReschedule.handler
);

module.exports = router;