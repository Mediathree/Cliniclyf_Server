const express = require("express");


const validate = require("../../../middleware/validateMiddleware");
const { authMiddleware } = require("../../../middleware/authMiddleware");
const { create_group_permission, get_group_permission } = require("../controllers/group_permission_Controller");

const router = express.Router();

router.post("/create", validate("body", create_group_permission.validation), authMiddleware, create_group_permission.handler);

router.get("/get/:id", authMiddleware, get_group_permission.handler);

module.exports = router;