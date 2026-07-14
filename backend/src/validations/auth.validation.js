'use strict';

const { z } = require('zod');

/** POST /auth/login body schema. */
const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .toLowerCase()
      .email('A valid email is required'),
    password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
  }),
});

/**
 * POST /auth/change-password body schema (authenticated). The user supplies their
 * current (temporary) password and a new one; we reject a new password that just
 * repeats the current one.
 */
const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z
        .string({ required_error: 'Current password is required' })
        .min(1, 'Current password is required'),
      newPassword: z
        .string({ required_error: 'New password is required' })
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password must be at most 128 characters'),
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: 'New password must be different from the current password',
      path: ['newPassword'],
    }),
});

// Strong-password rule shared by the reset flow: 8–128 chars with at least one
// lowercase letter, one uppercase letter and one digit.
const strongPassword = z
  .string({ required_error: 'New password is required' })
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

/** POST /auth/forgot-password — email only. */
const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .toLowerCase()
      .email('A valid email is required'),
  }),
});

/** POST /auth/reset-password — one-time token + new password. */
const resetPasswordSchema = z.object({
  body: z.object({
    token: z
      .string({ required_error: 'Reset token is required' })
      .min(1, 'Reset token is required'),
    newPassword: strongPassword,
  }),
});

module.exports = { loginSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema };
