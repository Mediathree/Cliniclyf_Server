const express = require('express');

const { createRating } = require('../controllers/ratingController');
const validate = require('../../../middleware/validateMiddleware');
const { authMiddleware, roleMiddleware } = require('../../../middleware/authMiddleware');

const router = express.Router();

router.post('/create', validate("body", createRating.validation), createRating.handler);

module.exports = router;