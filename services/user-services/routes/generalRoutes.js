const express = require("express");

const { getEntity } = require("../controllers/generalController");
const validate = require("../../../middleware/validateMiddleware");

const router = express.Router();

// Get entity
router.get("/entity/get", validate("query", getEntity.validation), getEntity.handler);

module.exports = router;