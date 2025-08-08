const express = require("express");


const validate = require("../../../middleware/validateMiddleware");
const { authMiddleware } = require("../../../middleware/authMiddleware");
const { createPermission, getPermissions } = require("../controllers/permissionController");

const router = express.Router();

router.post("/create", validate("body", createPermission.validation), authMiddleware, createPermission.handler);

router.get("/get", getPermissions.handler);

module.exports = router;