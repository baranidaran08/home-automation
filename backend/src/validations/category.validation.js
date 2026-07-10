'use strict';

const { z } = require('zod');
const mongoose = require('mongoose');

/** Reusable Mongo ObjectId validator. */
const objectId = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), { message: 'Invalid identifier' });

const categoryName = z
  .string({ required_error: 'Category name is required' })
  .trim()
  .min(2, 'Category name must be at least 2 characters')
  .max(100, 'Category name must be at most 100 characters');

const description = z
  .string()
  .trim()
  .max(500, 'Description must be at most 500 characters')
  .optional();

/** POST /categories */
const createCategorySchema = z.object({
  body: z.object({
    categoryName,
    description,
  }),
});

/** PATCH /categories/:id — all fields optional, but at least one required. */
const updateCategorySchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      categoryName: categoryName.optional(),
      description,
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Provide at least one field to update',
    }),
});

/** GET /categories/:id and DELETE /categories/:id */
const idParamSchema = z.object({
  params: z.object({ id: objectId }),
});

/** GET /categories?page&limit&search */
const listCategoriesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    search: z.string().trim().optional(),
  }),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  idParamSchema,
  listCategoriesSchema,
};
