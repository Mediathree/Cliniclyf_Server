const express = require("express");

const { createOrder, getOrders, getOrderById, updateOrder, deleteOrder, verifyOrder } = require("../controllers/orderController");
const validate = require("../../../middleware/validateMiddleware");
const { authMiddleware, roleMiddleware } = require("../../../middleware/authMiddleware");

const router = express.Router();

// Create a new order
router.post("/create", validate("body", createOrder.validation), authMiddleware, createOrder.handler);

// Get all orders
router.get("/get", authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID, process.env.PATIENT_ID]), getOrders.handler);

// Get a specific order by ID
router.get("/:id", validate("params", getOrderById.validation), authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID, process.env.PATIENT_ID]), getOrderById.handler);

// Update an order
router.put("/update", validate("body", updateOrder.validation), authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID, process.env.PATIENT_ID]), updateOrder.handler);

// Delete an order
router.delete("/delete/:id", validate("params", deleteOrder.validation), authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID, process.env.PATIENT_ID]), deleteOrder.handler);

router.post("/verify", authMiddleware, verifyOrder.handler)

module.exports = router;