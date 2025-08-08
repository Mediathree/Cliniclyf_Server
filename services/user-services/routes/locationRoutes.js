const express = require("express");

const { createLocation, getLocations, getLocationById, updateLocation, deleteLocation } = require("../controllers/locationController");
const validate = require("../../../middleware/validateMiddleware");
const { authMiddleware, roleMiddleware } = require("../../../middleware/authMiddleware");

const router = express.Router();

// Create a new location
router.post("/create", validate("body", createLocation.validation), authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID, process.env.DOCTOR_ID]), createLocation.handler);

// Get all locations
router.get("/get", getLocations.handler);

// Get a specific location by ID
router.get("/:id", validate("params", getLocationById.validation), getLocationById.handler);

// Update a location
router.put("/update", validate("body", updateLocation.validation), authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID, process.env.DOCTOR_ID]), updateLocation.handler);

// Delete a location
router.delete("/delete/:id", validate("params", deleteLocation.validation), authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID]), deleteLocation.handler);

module.exports = router;