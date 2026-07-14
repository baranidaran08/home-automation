'use strict';

const { Router } = require('express');
const productController = require('../controllers/product.controller');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { PERMS } = require('../constants');
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

// All product routes require authentication; each verb also requires the
// matching `products:*` permission.
router.use(authenticate);

// Static routes before parameterised ones so "/brands" isn't caught by "/:id".
router.get('/brands', authorize(PERMS.products.read), productController.brands);

router
  .route('/')
  .get(authorize(PERMS.products.read), validate(listProductsSchema), productController.list)
  // Multer parses multipart first (files -> req.files, fields -> req.body),
  // then Zod validates the text fields.
  .post(
    authorize(PERMS.products.create),
    uploadImages,
    validate(createProductSchema),
    productController.create
  );

router
  .route('/:id')
  .get(authorize(PERMS.products.read), validate(idParamSchema), productController.getById)
  .patch(
    authorize(PERMS.products.update),
    uploadImages,
    validate(updateProductSchema),
    productController.update
  )
  .delete(authorize(PERMS.products.delete), validate(idParamSchema), productController.remove);

module.exports = router;
