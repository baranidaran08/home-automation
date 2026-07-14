import { z } from 'zod';

/**
 * User add/edit form schema. Password is only relevant when editing (blank = keep
 * the current password). On create there is no password field at all — the backend
 * generates a secure temporary one — so the field is simply optional here and the
 * create form never renders or submits it. Mirrors the backend validation
 * (user.validation.js: create has no password; change happens via change-password).
 */
export const userFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name must be at most 120 characters'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z
    .string()
    .max(128, 'Password must be at most 128 characters')
    .refine((v) => v === '' || v.length >= 8, 'Password must be at least 8 characters')
    .optional()
    .or(z.literal('')),
  role: z.string().min(1, 'Please select a role'),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

export const userFormDefaults: UserFormValues = {
  name: '',
  email: '',
  password: '',
  role: '',
};
