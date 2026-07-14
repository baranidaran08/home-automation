'use strict';

const { Router } = require('express');
const templateController = require('../controllers/template.controller');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { PERMS } = require('../constants');
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

// All template routes require authentication; each verb also requires the
// matching `templates:*` permission.
router.use(authenticate);

router
  .route('/')
  .get(authorize(PERMS.templates.read), validate(listTemplatesSchema), templateController.list)
  .post(
    authorize(PERMS.templates.create),
    uploadTemplateFile,
    validate(createTemplateSchema),
    templateController.create
  );

// Download before "/:id" is fine (distinct suffix), but keep it explicit.
router.get(
  '/:id/download',
  authorize(PERMS.templates.read),
  validate(idParamSchema),
  templateController.download
);

router
  .route('/:id')
  .get(authorize(PERMS.templates.read), validate(idParamSchema), templateController.getById)
  .patch(
    authorize(PERMS.templates.update),
    uploadTemplateFile,
    validate(updateTemplateSchema),
    templateController.update
  )
  .delete(authorize(PERMS.templates.delete), validate(idParamSchema), templateController.remove);

module.exports = router;
