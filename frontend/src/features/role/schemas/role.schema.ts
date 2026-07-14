import { z } from 'zod';

/** Role add/edit form schema (name + description). Permissions are managed
 * separately as a checkbox matrix and submitted as an array of ids. */
export const roleFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Role name must be at least 2 characters')
    .max(60, 'Role name must be at most 60 characters'),
  description: z
    .string()
    .trim()
    .max(300, 'Description must be at most 300 characters')
    .optional()
    .or(z.literal('')),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;

export const roleFormDefaults: RoleFormValues = {
  name: '',
  description: '',
};
