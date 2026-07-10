'use strict';

const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth.middleware');
const { loginSchema } = require('../validations/auth.validation');

const router = Router();

// Public
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);

// Protected
router.get('/me', authenticate, authController.getCurrentAdmin);

module.exports = router;
