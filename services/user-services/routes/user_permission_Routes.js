const express = require("express");


const validate = require("../../../middleware/validateMiddleware");
const { authMiddleware } = require("../../../middleware/authMiddleware");
const { create_user_permission, get_user_permission } = require("../controllers/user_permission_Controller");

const router = express.Router();

router.post("/create", validate("body", create_user_permission.validation), authMiddleware, create_user_permission.handler);

router.get("/get/:id", authMiddleware, get_user_permission.handler);

module.exports = router;