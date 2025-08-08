const express = require("express");
const { createAddress, getUserAddresses, getAddressById, updateAddress, deleteAddress } = require("../controllers/userAddressController");
const { authMiddleware } = require("../../../middleware/authMiddleware");
const validate = require("../../../middleware/validateMiddleware");

const router = express.Router();

// Create a new address
router.post("/create", authMiddleware, validate("body", createAddress.validation), createAddress.handler);

// Get all addresses for a user
router.get("/get", getUserAddresses.handler);

// Get a specific address
router.get("/:id", authMiddleware, validate("params", getAddressById.validation), getAddressById.handler);

// Update an address
router.put("/", authMiddleware, validate("body", updateAddress.validation), updateAddress.handler);

// Delete an address
router.delete("/:id", authMiddleware, validate("params", deleteAddress.validation), deleteAddress.handler);

module.exports = router;
