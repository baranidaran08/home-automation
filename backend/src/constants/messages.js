'use strict';

/** Reusable, human-readable messages to keep responses consistent. */
const MESSAGES = {
  HEALTH_OK: 'Service is healthy',
  ROUTE_NOT_FOUND: 'The requested resource was not found',
  VALIDATION_FAILED: 'Validation failed',
  INTERNAL_ERROR: 'Something went wrong',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'You do not have permission to perform this action',

  // Auth
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  INVALID_CREDENTIALS: 'Invalid email or password',
  CURRENT_ADMIN_FETCHED: 'Current admin fetched successfully',
  TOKEN_MISSING: 'Authentication token is missing',
  TOKEN_INVALID: 'Invalid or expired authentication token',
  ADMIN_NOT_FOUND: 'Admin account no longer exists',

  // Dashboard
  DASHBOARD_SUMMARY_FETCHED: 'Dashboard summary fetched successfully',

  // Category
  CATEGORY_CREATED: 'Category created successfully',
  CATEGORY_UPDATED: 'Category updated successfully',
  CATEGORY_DELETED: 'Category deleted successfully',
  CATEGORY_FETCHED: 'Category fetched successfully',
  CATEGORIES_FETCHED: 'Categories fetched successfully',
  CATEGORY_NOT_FOUND: 'Category not found',
  CATEGORY_DUPLICATE: 'A category with this name already exists',
  INVALID_ID: 'Invalid identifier',

  // Product
  PRODUCT_CREATED: 'Product created successfully',
  PRODUCT_UPDATED: 'Product updated successfully',
  PRODUCT_DELETED: 'Product deleted successfully',
  PRODUCT_FETCHED: 'Product fetched successfully',
  PRODUCTS_FETCHED: 'Products fetched successfully',
  PRODUCT_NOT_FOUND: 'Product not found',
  BRANDS_FETCHED: 'Brands fetched successfully',
  IMAGE_UPLOAD_FAILED: 'Failed to upload one or more images',

  // Template
  TEMPLATE_CREATED: 'Template uploaded successfully',
  TEMPLATE_UPDATED: 'Template updated successfully',
  TEMPLATE_DELETED: 'Template deleted successfully',
  TEMPLATE_FETCHED: 'Template fetched successfully',
  TEMPLATES_FETCHED: 'Templates fetched successfully',
  TEMPLATE_NOT_FOUND: 'Template not found',
  TEMPLATE_CATEGORY_EXISTS:
    'This category already has a template. Replace the existing one instead.',
  TEMPLATE_FILE_REQUIRED: 'A Word (.docx) template file is required',
  TEMPLATE_UPLOAD_FAILED: 'Failed to upload the template file',
  TEMPLATE_INVALID_DOCX: 'The uploaded file is not a valid Word (.docx) document',
  TEMPLATE_MISSING_PLACEHOLDERS: 'The template is missing required placeholders',

  // Quotation
  QUOTATION_CREATED: 'Quotation created successfully',
  QUOTATION_UPDATED: 'Quotation updated successfully',
  QUOTATION_DELETED: 'Quotation deleted successfully',
  QUOTATION_FETCHED: 'Quotation fetched successfully',
  QUOTATIONS_FETCHED: 'Quotations fetched successfully',
  QUOTATION_NOT_FOUND: 'Quotation not found',
  QUOTATION_GENERATED: 'Quotation PDF generated successfully',
  QUOTATION_NO_ITEMS: 'At least one product is required',
  QUOTATION_TEMPLATE_MISSING: 'No Word template exists for one or more selected categories',
  QUOTATION_GENERATION_FAILED: 'Failed to generate the quotation document',
  PDF_CONVERT_FAILED:
    'Failed to convert the document to PDF. Ensure LibreOffice is installed on the server.',
};

module.exports = { MESSAGES };
