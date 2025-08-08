const express = require("express");


const validate = require("../../../middleware/validateMiddleware");
const { authMiddleware } = require("../../../middleware/authMiddleware");
const { createGroup, getGroups, updateGroup, deleteGroup } = require("../controllers/groupController");

const router = express.Router();

router.post("/create", authMiddleware, validate("body", createGroup.validation), createGroup.handler);

router.get("/get", authMiddleware, getGroups.handler);

router.put("/update", authMiddleware, validate("body", updateGroup.validation), updateGroup.handler);

router.delete("/delete/:id", authMiddleware, validate("params", deleteGroup.validation), deleteGroup.handler);

module.exports = router;