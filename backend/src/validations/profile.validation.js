'use strict';

const { z } = require('zod');

/**
 * Self-service profile validation. Mirrors the user field rules but is scoped to
 * the fields a user may change on their OWN account (name, email, phone, and the
 * profile picture). Role/password are intentionally absent — role changes go
 * through the admin Users API and passwords through change/reset-password.
 *
 * Unlike the admin update schema, an empty text body is allowed: uploading or
 * removing only the avatar (handled by multer / the `removeAvatar` flag) is a
 * valid update on its own.
 */
const name = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(120, 'Name must be at most 120 characters');

const email = z.string().trim().toLowerCase().email('Enter a valid email address');

const phone = z
  .string()
  .trim()
  .max(20, 'Phone number must be at most 20 characters')
  .refine((v) => v === '' || /^[+\d][\d\s()-]{5,}$/.test(v), 'Enter a valid phone number');

const removeAvatar = z.union([z.boolean(), z.enum(['true', 'false'])]);

const updateProfileSchema = z.object({
  body: z.object({
    name: name.optional(),
    email: email.optional(),
    phone: phone.optional(),
    removeAvatar: removeAvatar.optional(),
  }),
});

module.exports = { updateProfileSchema };
