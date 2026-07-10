'use strict';

const { Router } = require('express');
const quotationController = require('../controllers/quotation.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth.middleware');
const {
  createQuotationSchema,
  updateQuotationSchema,
  idParamSchema,
  listQuotationsSchema,
} = require('../validations/quotation.validation');

const router = Router();

// All quotation routes require an authenticated admin.
router.use(authenticate);

router
  .route('/')
  .get(validate(listQuotationsSchema), quotationController.list)
  .post(validate(createQuotationSchema), quotationController.create);

router.post('/:id/generate', validate(idParamSchema), quotationController.generate);
router.get('/:id/download', validate(idParamSchema), quotationController.download);

router
  .route('/:id')
  .get(validate(idParamSchema), quotationController.getById)
  .patch(validate(updateQuotationSchema), quotationController.update);

module.exports = router;
