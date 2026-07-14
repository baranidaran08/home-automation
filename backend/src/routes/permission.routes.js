'use strict';

const { Router } = require('express');
const permissionController = require('../controllers/permission.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { PERMS } = require('../constants');

const router = Router();

// Reading the permission catalogue is part of managing roles.
router.use(authenticate);

router.get('/', authorize(PERMS.roles.read), permissionController.list);

module.exports = router;
