import { z } from 'zod';

/**
 * Personal-information form (My Profile + User Details). Mirrors the backend
 * profile/user validation: name and email are required and validated; phone is
 * optional (blank clears it) and loosely checked so it works across regions.
 */
export const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name must be at most 120 characters'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .max(20, 'Phone number must be at most 20 characters')
    .refine((v) => v === '' || /^[+\d][\d\s()-]{5,}$/.test(v), 'Enter a valid phone number'),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
