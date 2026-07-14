'use strict';

const { Router } = require('express');
const roleController = require('../controllers/role.controller');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { PERMS } = require('../constants');
const {
  createRoleSchema,
  updateRoleSchema,
  idParamSchema,
  listRolesSchema,
} = require('../validations/role.validation');

const router = Router();

// All role routes require authentication; each verb also requires the matching
// `roles:*` permission (Super Admin bypasses via the wildcard).
router.use(authenticate);

router
  .route('/')
  .get(authorize(PERMS.roles.read), validate(listRolesSchema), roleController.list)
  .post(authorize(PERMS.roles.create), validate(createRoleSchema), roleController.create);

router
  .route('/:id')
  .get(authorize(PERMS.roles.read), validate(idParamSchema), roleController.getById)
  .patch(authorize(PERMS.roles.update), validate(updateRoleSchema), roleController.update)
  .delete(authorize(PERMS.roles.delete), validate(idParamSchema), roleController.remove);

module.exports = router;
