'use strict';

const { z } = require('zod');
const mongoose = require('mongoose');

/** Reusable Mongo ObjectId validator. */
const objectId = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), { message: 'Invalid identifier' });

const name = z
  .string({ required_error: 'Name is required' })
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(120, 'Name must be at most 120 characters');

const email = z
  .string({ required_error: 'Email is required' })
  .trim()
  .toLowerCase()
  .email('Enter a valid email address');

const password = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters');

// Optional phone number. Kept permissive (digits, spaces, +, -, parens) so it
// works across regions; an empty string clears the stored value.
const phone = z
  .string()
  .trim()
  .max(20, 'Phone number must be at most 20 characters')
  .refine((v) => v === '' || /^[+\d][\d\s()-]{5,}$/.test(v), 'Enter a valid phone number');

// Multipart sends everything as strings, so the remove-avatar flag is the
// literal string 'true'/'false' (or a boolean when sent as JSON).
const removeAvatar = z.union([z.boolean(), z.enum(['true', 'false'])]);

/**
 * POST /users — no password field. The backend generates a secure temporary
 * password itself (see user.service), so a Super Admin never sets one.
 */
const createUserSchema = z.object({
  body: z.object({
    name,
    email,
    role: objectId,
  }),
});

/**
 * PATCH /users/:id — all fields optional, but at least one required. Accepts an
 * optional `avatar` file (handled by multer, not here) plus a `removeAvatar`
 * flag; either one alone counts as a valid update even with no text fields.
 */
const updateUserSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      name: name.optional(),
      email: email.optional(),
      password: password.optional(),
      role: objectId.optional(),
      phone: phone.optional(),
      removeAvatar: removeAvatar.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Provide at least one field to update',
    }),
});

/** GET /users/:id and DELETE /users/:id */
const idParamSchema = z.object({
  params: z.object({ id: objectId }),
});

/** GET /users?page&limit&search&role */
const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    search: z.string().trim().optional(),
    role: objectId.optional(),
  }),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  idParamSchema,
  listUsersSchema,
};
