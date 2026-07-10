'use strict';

const { z } = require('zod');
const mongoose = require('mongoose');

const objectId = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), { message: 'Invalid identifier' });

const templateName = z
  .string({ required_error: 'Template name is required' })
  .trim()
  .min(2, 'Template name must be at least 2 characters')
  .max(150, 'Template name must be at most 150 characters');

const description = z
  .string()
  .trim()
  .max(500, 'Description must be at most 500 characters')
  .optional();

/** POST /templates (multipart: pdf) */
const createTemplateSchema = z.object({
  body: z.object({
    category: objectId,
    templateName,
    description,
  }),
});

/** PATCH /templates/:id (multipart: optional pdf). All fields optional. */
const updateTemplateSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    category: objectId.optional(),
    templateName: templateName.optional(),
    description,
  }),
});

const idParamSchema = z.object({ params: z.object({ id: objectId }) });

/** GET /templates?page&limit&search&category */
const listTemplatesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    search: z.string().trim().optional(),
    category: objectId.optional(),
  }),
});

module.exports = {
  createTemplateSchema,
  updateTemplateSchema,
  idParamSchema,
  listTemplatesSchema,
};
