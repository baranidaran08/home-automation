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
  CURRENT_USER_FETCHED: 'Current user fetched successfully',
  TOKEN_MISSING: 'Authentication token is missing',
  TOKEN_INVALID: 'Invalid or expired authentication token',
  USER_NOT_FOUND: 'User account no longer exists',

  // First-login / change-password flow
  PASSWORD_CHANGE_REQUIRED: 'You must change your temporary password before continuing',
  PASSWORD_CHANGED: 'Password changed successfully',
  CURRENT_PASSWORD_INVALID: 'The current password is incorrect',
  PASSWORD_SAME: 'New password must be different from the current password',

  // Google OAuth / authentication-method locking
  GOOGLE_LOGIN_SUCCESS: 'Signed in with Google successfully',
  GOOGLE_TOKEN_MISSING: 'A Google credential is required',
  GOOGLE_AUTH_FAILED: 'Google authentication failed. Please try again.',
  GOOGLE_EMAIL_UNVERIFIED: 'Your Google email address is not verified.',
  GOOGLE_NOT_CONFIGURED: 'Google Sign-In is not configured on the server.',
  // Shown when a Google account's email does not match any invited user. We do
  // NOT create accounts from Google — only pre-invited users may authenticate.
  GOOGLE_EMAIL_MISMATCH: 'This Google account does not match the invited email address.',
  // Method-lock rejections (the account already activated with the other method).
  ACCOUNT_USES_LOCAL: 'This account uses Email & Password authentication.',
  ACCOUNT_USES_GOOGLE: 'This account is linked with Google Sign-In.',

  // Forgot / reset password flow. The request message is intentionally generic so
  // it never reveals whether an email is registered (enumeration protection).
  PASSWORD_RESET_REQUESTED: 'If an account exists, a reset link has been sent.',
  PASSWORD_RESET_SUCCESS: 'Your password has been reset successfully. Please log in.',
  PASSWORD_RESET_TOKEN_INVALID:
    'This reset link is invalid or has expired. Please request a new one.',

  // User (RBAC-managed accounts)
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  USER_FETCHED: 'User fetched successfully',
  USERS_FETCHED: 'Users fetched successfully',
  USER_DUPLICATE: 'A user with this email already exists',
  USER_ROLE_REQUIRED: 'A valid role is required',
  USER_SELF_DELETE: 'You cannot delete your own account',
  USER_LAST_SUPER_ADMIN: 'Cannot remove the last Super Admin',
  // Root Super Admin — the protected seeded owner account.
  ROOT_DELETE_BLOCKED: 'The Root Super Admin account is protected and cannot be deleted',
  ROOT_ROLE_LOCKED: "The Root Super Admin's role cannot be changed",
  ROOT_EDIT_BLOCKED: 'The Root Super Admin can only be edited by the account owner',
  ROOT_DISABLE_BLOCKED: 'The Root Super Admin account cannot be disabled',

  // Role
  ROLE_CREATED: 'Role created successfully',
  ROLE_UPDATED: 'Role updated successfully',
  ROLE_DELETED: 'Role deleted successfully',
  ROLE_FETCHED: 'Role fetched successfully',
  ROLES_FETCHED: 'Roles fetched successfully',
  ROLE_NOT_FOUND: 'Role not found',
  ROLE_DUPLICATE: 'A role with this name already exists',
  ROLE_SYSTEM_LOCKED: 'System roles cannot be modified or deleted',
  ROLE_IN_USE: 'This role is assigned to one or more users and cannot be deleted',
  ROLE_INVALID_PERMISSIONS: 'One or more permissions are invalid',
  ROLE_MISSING_DEPENDENCIES:
    'Invalid permission combination — the following required permissions are missing',

  // Permission
  PERMISSIONS_FETCHED: 'Permissions fetched successfully',

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
    'Failed to convert the document to PDF. Please try again, or contact support if this continues.',
};

module.exports = { MESSAGES };
