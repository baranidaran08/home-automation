import { z } from 'zod';

/** Category add/edit form schema. Mirrors the backend validation. */
export const categoryFormSchema = z.object({
  categoryName: z
    .string()
    .trim()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must be at most 100 characters'),
  description: z
    .string()
    .trim()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .or(z.literal('')),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

/** Default values for the create form. */
export const categoryFormDefaults: CategoryFormValues = {
  categoryName: '',
  description: '',
};
