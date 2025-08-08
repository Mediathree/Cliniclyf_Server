const express = require("express");
const multer = require("multer");

const { createClinic, getClinics, getClinicById, updateClinic, deleteClinic, activateClinic, deactivateClinic, billingRegister } = require("../controllers/clinicController");
const validate = require("../../../middleware/validateMiddleware");
const { authMiddleware, roleMiddleware } = require("../../../middleware/authMiddleware");
const { storage } = require('../../../config/cloudinary.js');
const parseServicesMiddleware = require("../../../middleware/parseData.js");

const upload = multer({ storage });

const router = express.Router();

// Create a new clinic
// router.post("/create", validate("body", createClinic.validation), authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID, process.env.DOCTOR_ID]), createClinic.handler);

router.post("/create", upload.single('photo'), parseServicesMiddleware, validate("body", createClinic.validation), authMiddleware, createClinic.handler);

// Get all clinics
router.get("/get", getClinics.handler);

// Get a specific clinic by ID
router.get("/:id", validate("params", getClinicById.validation), getClinicById.handler);

// activate clinic
router.patch("/activate", activateClinic.handler);

// deactivate clinic
router.patch("/deactivate", deactivateClinic.handler);

// Update a clinic
router.put("/update", upload.single("photo"), parseServicesMiddleware, validate("body", updateClinic.validation), authMiddleware, updateClinic.handler);

// Delete a clinic    
router.delete("/delete/:id", validate("params", deleteClinic.validation), authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID]), deleteClinic.handler);

// Register a clinic for medical billing
router.post(
    "/billing/register",
    validate("body", billingRegister.validation),
    billingRegister.handler
);

module.exports = router;