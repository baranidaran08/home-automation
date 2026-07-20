'use strict';

const { Router } = require('express');
const userController = require('../controllers/user.controller');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { PERMS } = require('../constants');
const { imageUploader } = require('../config/multer');
const {
  createUserSchema,
  updateUserSchema,
  idParamSchema,
  listUsersSchema,
} = require('../validations/user.validation');

const router = Router();

// Optional profile-picture upload on user edit. Multer only parses
// `multipart/form-data`; plain JSON updates pass straight through untouched.
const uploadAvatar = imageUploader.single('avatar');

// All user routes require authentication; each verb also requires the matching
// `users:*` permission (Super Admin bypasses via the wildcard).
router.use(authenticate);

router
  .route('/')
  .get(authorize(PERMS.users.read), validate(listUsersSchema), userController.list)
  .post(authorize(PERMS.users.create), validate(createUserSchema), userController.create);

router
  .route('/:id')
  .get(authorize(PERMS.users.read), validate(idParamSchema), userController.getById)
  .patch(
    authorize(PERMS.users.update),
    uploadAvatar,
    validate(updateUserSchema),
    userController.update
  )
  .delete(authorize(PERMS.users.delete), validate(idParamSchema), userController.remove);

module.exports = router;
