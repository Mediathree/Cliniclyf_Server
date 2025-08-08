const express = require("express");


const validate = require("../../../middleware/validateMiddleware");
const { authMiddleware } = require("../../../middleware/authMiddleware");
const { createPermissionCategory, getPermissionCategory } = require("../controllers/permissionCategoryController");

const router = express.Router();

router.post("/create", validate("body", createPermissionCategory.validation), authMiddleware, createPermissionCategory.handler);

router.get("/get", authMiddleware, getPermissionCategory.handler);

module.exports = router;