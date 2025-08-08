const express = require("express");

const validate = require("../../../middleware/validateMiddleware");
const { authMiddleware } = require("../../../middleware/authMiddleware");
const { createSubSubCategory, getSubSubCategory } = require("../controllers/subSubCategoryController");

const router = express.Router();

router.post("/create", authMiddleware, validate("body", createSubSubCategory.validation), createSubSubCategory.handler);

router.get("/get", authMiddleware, getSubSubCategory.handler);

module.exports = router;