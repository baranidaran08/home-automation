'use strict';

const { Router } = require('express');
const profileController = require('../controllers/profile.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth.middleware');
const { imageUploader } = require('../config/multer');
const { updateProfileSchema } = require('../validations/profile.validation');

const router = Router();

// Optional profile-picture upload. Multer only parses `multipart/form-data`;
// plain JSON updates pass straight through untouched.
const uploadAvatar = imageUploader.single('avatar');

// Self-service profile. Only `authenticate` (no `authorize`): every signed-in
// user may manage their OWN account regardless of RBAC permissions — there is no
// separate permission for editing yourself. The service is scoped to req.user.
router.use(authenticate);

router.patch('/', uploadAvatar, validate(updateProfileSchema), profileController.updateProfile);

module.exports = router;
