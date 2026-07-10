import { z } from 'zod';

/** Product add/edit form schema (text fields; images handled separately). */
export const productFormSchema = z.object({
  productName: z
    .string()
    .trim()
    .min(2, 'Product name must be at least 2 characters')
    .max(150, 'Product name must be at most 150 characters'),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().trim().max(100).optional().or(z.literal('')),
  modelNumber: z.string().trim().max(100).optional().or(z.literal('')),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  specifications: z.string().trim().max(4000).optional().or(z.literal('')),
  warranty: z.string().trim().max(200).optional().or(z.literal('')),
  price: z.coerce.number({ invalid_type_error: 'Price is required' }).min(0, 'Price cannot be negative'),
  stock: z.coerce.number({ invalid_type_error: 'Stock is required' }).min(0, 'Stock cannot be negative'),
  status: z.enum(['active', 'inactive']),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const productFormDefaults: ProductFormValues = {
  productName: '',
  category: '',
  brand: '',
  modelNumber: '',
  description: '',
  specifications: '',
  warranty: '',
  price: 0,
  stock: 0,
  status: 'active',
};

/** Client-side image constraints (mirror the backend multer limits). */
export const IMAGE_RULES = {
  maxCount: 6,
  maxSizeMb: 10,
  accept: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
};
