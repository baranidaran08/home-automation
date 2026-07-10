'use strict';

const { Router } = require('express');
const productController = require('../controllers/product.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth.middleware');
const { imageUploader } = require('../config/multer');
const {
  createProductSchema,
  updateProductSchema,
  idParamSchema,
  listProductsSchema,
} = require('../validations/product.validation');

const router = Router();

// Max images accepted per product upload.
const MAX_IMAGES = 6;
const uploadImages = imageUploader.array('images', MAX_IMAGES);

// All product routes require an authenticated admin.
router.use(authenticate);

// Static routes before parameterised ones so "/brands" isn't caught by "/:id".
router.get('/brands', productController.brands);

router
  .route('/')
  .get(validate(listProductsSchema), productController.list)
  // Multer parses multipart first (files -> req.files, fields -> req.body),
  // then Zod validates the text fields.
  .post(uploadImages, validate(createProductSchema), productController.create);

router
  .route('/:id')
  .get(validate(idParamSchema), productController.getById)
  .patch(uploadImages, validate(updateProductSchema), productController.update)
  .delete(validate(idParamSchema), productController.remove);

module.exports = router;
