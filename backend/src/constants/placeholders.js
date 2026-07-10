'use strict';

/**
 * Placeholders a Word quotation template MUST contain. Uploads missing any of
 * these are rejected. Stored (as bare names, no braces) on the template so the
 * Quotation module can later fill them in.
 */
const REQUIRED_PLACEHOLDERS = [
  'customer_name',
  'phone',
  'email',
  'address',
  'project_name',
  'project_location',
  'quotation_number',
  'quotation_date',
  'product_table',
  'service_total',
];

module.exports = { REQUIRED_PLACEHOLDERS };
