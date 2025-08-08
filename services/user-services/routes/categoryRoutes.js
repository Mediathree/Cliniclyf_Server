const express = require("express");


const validate = require("../../../middleware/validateMiddleware");
const { authMiddleware } = require("../../../middleware/authMiddleware");
const { createCategory, getCategory } = require("../controllers/categoryController");

const router = express.Router();

router.post("/create", authMiddleware, validate("body", createCategory.validation), createCategory.handler);

router.get("/get", authMiddleware, getCategory.handler);

module.exports = router;