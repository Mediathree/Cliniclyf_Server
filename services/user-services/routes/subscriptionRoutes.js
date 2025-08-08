const express = require('express');

const { createSubscription, getSubscription, updateSubscription, deleteSubscription } = require('../controllers/subscriptionController');
const validate = require('../../../middleware/validateMiddleware');
const { authMiddleware, roleMiddleware } = require('../../../middleware/authMiddleware');

const router = express.Router();

router.post('/create', validate("body", createSubscription.validation), authMiddleware, createSubscription.handler);

router.get('/get', authMiddleware, getSubscription.handler);

router.put('/update', validate("body", updateSubscription.validation), authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID, process.env.DOCTOR_ID]), updateSubscription.handler);

router.delete('/delete/:id', validate("params", deleteSubscription.validation), deleteSubscription.handler);

// router.delete('/delete/:id', validate("params", deleteSubscription.validation), authMiddleware, roleMiddleware([process.env.ADMIN_ROLE_ID]), deleteSubscription.handler);

module.exports = router;