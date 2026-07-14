'use strict';

const { Router } = require('express');
const quotationController = require('../controllers/quotation.controller');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { PERMS } = require('../constants');
const {
  createQuotationSchema,
  updateQuotationSchema,
  idParamSchema,
  listQuotationsSchema,
} = require('../validations/quotation.validation');

const router = Router();

// All quotation routes require authentication; each verb also requires the
// matching `quotations:*` permission. Generating a PDF mutates the quotation,
// so it maps to `update`; downloading is a read.
router.use(authenticate);

router
  .route('/')
  .get(authorize(PERMS.quotations.read), validate(listQuotationsSchema), quotationController.list)
  .post(
    authorize(PERMS.quotations.create),
    validate(createQuotationSchema),
    quotationController.create
  );

router.post(
  '/:id/generate',
  authorize(PERMS.quotations.update),
  validate(idParamSchema),
  quotationController.generate
);
router.get(
  '/:id/download',
  authorize(PERMS.quotations.read),
  validate(idParamSchema),
  quotationController.download
);

router
  .route('/:id')
  .get(authorize(PERMS.quotations.read), validate(idParamSchema), quotationController.getById)
  .patch(
    authorize(PERMS.quotations.update),
    validate(updateQuotationSchema),
    quotationController.update
  );

module.exports = router;
