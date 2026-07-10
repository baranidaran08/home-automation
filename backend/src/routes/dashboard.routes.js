'use strict';

const { Router } = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = Router();

// All dashboard routes require an authenticated admin.
router.use(authenticate);

router.get('/summary', dashboardController.getSummary);

module.exports = router;
