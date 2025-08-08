const express = require("express");

const { createPayment, getPayment, updatePayment, deletePayment } = require("../controllers/paymentController");

const validate = require("../../../middleware/validateMiddleware");
const { authMiddleware, roleMiddleware } = require("../../../middleware/authMiddleware");
const { getPayments } = require("../controllers/paymentController");

const router = express.Router();

router.post("/create", validate("body", createPayment.validation), authMiddleware, createPayment.handler);

router.get("/get", authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID, process.env.PATIENT_ID]), getPayments.handler);

router.get("/:id", validate("params", getPayment.validation), authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID, process.env.PATIENT_ID]), getPayment.handler);

router.put("/update", validate("body", updatePayment.validation), authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID, process.env.PATIENT_ID]), updatePayment.handler);

router.delete("/delete/:id", validate("params", deletePayment.validation), authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID, process.env.PATIENT_ID]), deletePayment.handler);

module.exports = router;