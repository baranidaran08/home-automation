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

module.exports = { loginSchema };
