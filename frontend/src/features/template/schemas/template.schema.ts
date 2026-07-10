import { z } from 'zod';

/** Template upload/edit form schema (text fields; the .docx is handled separately). */
export const templateFormSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  templateName: z
    .string()
    .trim()
    .min(2, 'Template name must be at least 2 characters')
    .max(150, 'Template name must be at most 150 characters'),
  description: z.string().trim().max(500).optional().or(z.literal('')),
});

export type TemplateFormValues = z.infer<typeof templateFormSchema>;

export const templateFormDefaults: TemplateFormValues = {
  category: '',
  templateName: '',
  description: '',
};

/** Client-side Word (.docx) constraints (mirror the backend multer limits). */
export const DOCX_RULES = {
  extension: '.docx',
  mimeTypes: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream',
    'application/zip',
  ],
  maxSizeMb: 10,
};
