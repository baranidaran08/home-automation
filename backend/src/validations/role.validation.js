'use strict';

const { z } = require('zod');
const mongoose = require('mongoose');

/** Reusable Mongo ObjectId validator. */
const objectId = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), { message: 'Invalid identifier' });

const name = z
  .string({ required_error: 'Role name is required' })
  .trim()
  .min(2, 'Role name must be at least 2 characters')
  .max(60, 'Role name must be at most 60 characters');

const description = z
  .string()
  .trim()
  .max(300, 'Description must be at most 300 characters')
  .optional();

// A role can be created with no permissions (they can be added later), but the
// array — when present — must contain valid ids.
const permissions = z.array(objectId).optional();

/** POST /roles */
const createRoleSchema = z.object({
  body: z.object({
    name,
    description,
    permissions,
  }),
});

/** PATCH /roles/:id — all fields optional, but at least one required. */
const updateRoleSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      name: name.optional(),
      description,
      permissions,
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Provide at least one field to update',
    }),
});

/** GET /roles/:id and DELETE /roles/:id */
const idParamSchema = z.object({
  params: z.object({ id: objectId }),
});

/** GET /roles?page&limit&search */
const listRolesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    search: z.string().trim().optional(),
  }),
});

module.exports = {
  createRoleSchema,
  updateRoleSchema,
  idParamSchema,
  listRolesSchema,
};
