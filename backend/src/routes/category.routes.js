'use strict';

const { Router } = require('express');
const categoryController = require('../controllers/category.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth.middleware');
const {
  createCategorySchema,
  updateCategorySchema,
  idParamSchema,
  listCategoriesSchema,
} = require('../validations/category.validation');

const router = Router();

// All category routes require an authenticated admin.
router.use(authenticate);

router
  .route('/')
  .get(validate(listCategoriesSchema), categoryController.list)
  .post(validate(createCategorySchema), categoryController.create);

router
  .route('/:id')
  .get(validate(idParamSchema), categoryController.getById)
  .patch(validate(updateCategorySchema), categoryController.update)
  .delete(validate(idParamSchema), categoryController.remove);

module.exports = router;
