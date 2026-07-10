/** Cloudinary reference to the stored Word (.docx) template file. */
export interface TemplateFile {
  publicId: string;
  secureUrl: string;
  originalFileName: string;
}

/** Category as embedded (populated) on a template response. */
export interface TemplateCategoryRef {
  _id: string;
  categoryName: string;
  slug: string;
}

/** A template (Word .docx quotation template) as returned by the API. */
export interface Template {
  _id: string;
  category: TemplateCategoryRef;
  templateName: string;
  description: string;
  templateFile: TemplateFile;
  /** Placeholders detected in the .docx (bare names, no braces). */
  placeholders: string[];
  createdAt: string;
  updatedAt: string;
}

/** Query params for the paginated list endpoint. */
export interface TemplateListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}
