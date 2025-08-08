const express = require("express");
const { createSpeciality, getSpecialities, getSpecialityById, updateSpeciality, deleteSpeciality } = require("../controllers/specialityController");
const validate = require("../../../middleware/validateMiddleware");
const { authMiddleware, roleMiddleware } = require("../../../middleware/authMiddleware");

const router = express.Router();

// Create speciality
router.post("/create", validate("body", createSpeciality.validation), authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID]), createSpeciality.handler);

// Get all specialities
router.get("/get", getSpecialities.handler);

// Get a specific speciality
router.get("/:id", validate("params", getSpecialityById.validation), getSpecialityById.handler);

// Update speciality
router.put("/update", validate("body", updateSpeciality.validation), authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID]), updateSpeciality.handler);

// Delete speciality
router.delete("/:id", validate("params", deleteSpeciality.validation), authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID]), deleteSpeciality.handler);

module.exports = router;
