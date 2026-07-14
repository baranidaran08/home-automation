'use strict';

const { Router } = require('express');
const categoryController = require('../controllers/category.controller');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { PERMS } = require('../constants');
const {
  createCategorySchema,
  updateCategorySchema,
  idParamSchema,
  listCategoriesSchema,
} = require('../validations/category.validation');

const router = Router();

// All category routes require authentication; each verb also requires the
// matching `categories:*` permission.
router.use(authenticate);

router
  .route('/')
  .get(authorize(PERMS.categories.read), validate(listCategoriesSchema), categoryController.list)
  .post(
    authorize(PERMS.categories.create),
    validate(createCategorySchema),
    categoryController.create
  );

router
  .route('/:id')
  .get(authorize(PERMS.categories.read), validate(idParamSchema), categoryController.getById)
  .patch(
    authorize(PERMS.categories.update),
    validate(updateCategorySchema),
    categoryController.update
  )
  .delete(authorize(PERMS.categories.delete), validate(idParamSchema), categoryController.remove);

module.exports = router;
