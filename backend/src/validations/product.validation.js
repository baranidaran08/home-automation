'use strict';

const { z } = require('zod');
const mongoose = require('mongoose');
const { ENTITY_STATUS_VALUES } = require('../constants/status');

const objectId = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), { message: 'Invalid identifier' });

const productName = z
  .string({ required_error: 'Product name is required' })
  .trim()
  .min(2, 'Product name must be at least 2 characters')
  .max(150, 'Product name must be at most 150 characters');

const optionalText = (max) => z.string().trim().max(max).optional();

const status = z.enum(ENTITY_STATUS_VALUES, {
  errorMap: () => ({ message: `Status must be one of: ${ENTITY_STATUS_VALUES.join(', ')}` }),
});

// Multipart form fields arrive as strings; treat '' as "not provided".
const emptyToUndefined = (val) => (val === '' || val === undefined ? undefined : val);

const requiredPrice = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number({ required_error: 'Price is required', invalid_type_error: 'Price must be a number' })
    .min(0, 'Price cannot be negative')
);
const optionalPrice = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number({ invalid_type_error: 'Price must be a number' })
    .min(0, 'Price cannot be negative')
);
const optionalStock = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number({ invalid_type_error: 'Stock must be a number' })
    .min(0, 'Stock cannot be negative')
);

// removeImages may arrive as a JSON string (multipart) or an array.
const removeImages = z
  .preprocess((val) => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return [val];
      }
    }
    return val;
  }, z.array(z.string()))
  .optional();

/** POST /products (multipart) */
const createProductSchema = z.object({
  body: z.object({
    productName,
    category: objectId,
    brand: optionalText(100),
    modelNumber: optionalText(100),
    description: optionalText(2000),
    specifications: optionalText(4000),
    warranty: optionalText(200),
    price: requiredPrice,
    stock: optionalStock.optional(),
    status: status.optional(),
  }),
});

/** PATCH /products/:id (multipart) */
const updateProductSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    productName: productName.optional(),
    category: objectId.optional(),
    brand: optionalText(100),
    modelNumber: optionalText(100),
    description: optionalText(2000),
    specifications: optionalText(4000),
    warranty: optionalText(200),
    price: optionalPrice.optional(),
    stock: optionalStock.optional(),
    status: status.optional(),
    removeImages,
  }),
});

const idParamSchema = z.object({ params: z.object({ id: objectId }) });

/** GET /products?page&limit&search&category&brand&status */
const listProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    search: z.string().trim().optional(),
    category: objectId.optional(),
    brand: z.string().trim().optional(),
    status: status.optional(),
  }),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  idParamSchema,
  listProductsSchema,
};
