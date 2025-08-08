const express = require("express");

const validate = require("../../../middleware/validateMiddleware");
const { authMiddleware } = require("../../../middleware/authMiddleware");
const { createSubCategory, getSubCategory } = require("../controllers/subCategoryController");

const router = express.Router();

router.post("/create", authMiddleware, validate("body", createSubCategory.validation), createSubCategory.handler);

router.get("/get", authMiddleware, getSubCategory.handler);

module.exports = router;