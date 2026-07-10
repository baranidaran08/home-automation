'use strict';

const { Router } = require('express');
const templateController = require('../controllers/template.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth.middleware');
const { docxUploader } = require('../config/multer');
const {
  createTemplateSchema,
  updateTemplateSchema,
  idParamSchema,
  listTemplatesSchema,
} = require('../validations/template.validation');

const router = Router();

// Single Word (.docx) file per template, field name "templateFile". Multer's
// docx filter rejects non-.docx files before the handler runs.
const uploadTemplateFile = docxUploader.single('templateFile');

// All template routes require an authenticated admin.
router.use(authenticate);

router
  .route('/')
  .get(validate(listTemplatesSchema), templateController.list)
  .post(uploadTemplateFile, validate(createTemplateSchema), templateController.create);

// Download before "/:id" is fine (distinct suffix), but keep it explicit.
router.get('/:id/download', validate(idParamSchema), templateController.download);

router
  .route('/:id')
  .get(validate(idParamSchema), templateController.getById)
  .patch(uploadTemplateFile, validate(updateTemplateSchema), templateController.update)
  .delete(validate(idParamSchema), templateController.remove);

module.exports = router;
