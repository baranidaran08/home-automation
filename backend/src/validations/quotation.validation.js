'use strict';

const { z } = require('zod');
const mongoose = require('mongoose');
const { QUOTATION_STATUS_VALUES } = require('../models/quotation.model');

const objectId = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), { message: 'Invalid identifier' });

const itemSchema = z.object({
  productId: objectId,
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
});

const customerFields = {
  customerName: z.string().trim().min(2, 'Customer name is required').max(150),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  email: z.string().trim().email('A valid email is required').optional().or(z.literal('')),
  address: z.string().trim().max(500).optional().or(z.literal('')),
  projectName: z.string().trim().max(200).optional().or(z.literal('')),
  projectLocation: z.string().trim().max(200).optional().or(z.literal('')),
};

// Per-category service charges: { [categoryId]: amount }.
const serviceCharges = z.record(z.coerce.number().min(0, 'Service charge cannot be negative'));

/** POST /quotations */
const createQuotationSchema = z.object({
  body: z.object({
    ...customerFields,
    categories: z.array(objectId).optional(),
    items: z.array(itemSchema).min(1, 'At least one product is required'),
    serviceCharges: serviceCharges.optional().default({}),
  }),
});

/** PATCH /quotations/:id */
const updateQuotationSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    customerName: customerFields.customerName.optional(),
    phone: customerFields.phone,
    email: customerFields.email,
    address: customerFields.address,
    projectName: customerFields.projectName,
    projectLocation: customerFields.projectLocation,
    categories: z.array(objectId).optional(),
    items: z.array(itemSchema).min(1, 'At least one product is required').optional(),
    serviceCharges: serviceCharges.optional(),
  }),
});

const idParamSchema = z.object({ params: z.object({ id: objectId }) });

/** GET /quotations?page&limit&search&status */
const listQuotationsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    search: z.string().trim().optional(),
    status: z.enum(QUOTATION_STATUS_VALUES).optional(),
  }),
});

module.exports = {
  createQuotationSchema,
  updateQuotationSchema,
  idParamSchema,
  listQuotationsSchema,
};
