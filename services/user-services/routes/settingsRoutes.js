const express = require('express');
require("dotenv").config();

const { authMiddleware, roleMiddleware } = require('../../../middleware/authMiddleware');
const { getSettings, upsertSetting } = require('../controllers/settingsController');

const router = express.Router();

router.post('/', authMiddleware, upsertSetting.handler);
router.get('/', authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID]), getSettings.handler);

module.exports = router;