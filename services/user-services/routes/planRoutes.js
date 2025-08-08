const express = require("express");

const { createPlan, getPlans, getPlanById, updatePlan, deletePlan } = require("../controllers/planController");
const validate = require("../../../middleware/validateMiddleware");
const { authMiddleware, roleMiddleware } = require("../../../middleware/authMiddleware");

const router = express.Router();

// Create a new plan
router.post("/create", createPlan.handler);

// Get all plans
router.get("/get", getPlans.handler);

// Get a specific plan by ID
router.get("/:id", validate("params", getPlanById.validation), getPlanById.handler);

// Update a plan
router.put("/update", validate("body", updatePlan.validation), authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID]), updatePlan.handler);

// Delete a plan
router.delete("/delete/:id", validate("params", deletePlan.validation), authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID]), deletePlan.handler);

module.exports = router;