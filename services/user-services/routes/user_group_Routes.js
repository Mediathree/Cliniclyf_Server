const express = require("express");


const validate = require("../../../middleware/validateMiddleware");
const { authMiddleware } = require("../../../middleware/authMiddleware");
const { add_user_group, remove_user_group, get_user_group } = require("../controllers/user_group_Controller");

const router = express.Router();

router.post("/add-user", validate("body", add_user_group.validation), authMiddleware, add_user_group.handler);

router.get("/get/:group_id", authMiddleware, get_user_group.handler);

router.delete("/remove-user", validate("query", remove_user_group.validation), authMiddleware, remove_user_group.handler);

module.exports = router;