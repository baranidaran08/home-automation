'use strict';

const { Router } = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { PERMS } = require('../constants');

const router = Router();

// All dashboard routes require an authenticated user with dashboard read access.
router.use(authenticate);

router.get('/summary', authorize(PERMS.dashboard.read), dashboardController.getSummary);

module.exports = router;
