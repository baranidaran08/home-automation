/**
 * Active/Inactive status union. Categories no longer use a status, but this
 * type is retained because the Products module reuses it for `ProductStatus`.
 */
export type CategoryStatus = 'active' | 'inactive';

/** A category (Home Automation field) as returned by the API. */
export interface Category {
  _id: string;
  categoryName: string;
  description: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

/** Payload for creating a category. */
export interface CreateCategoryInput {
  categoryName: string;
  description?: string;
}

/** Payload for updating a category (partial). */
export type UpdateCategoryInput = Partial<CreateCategoryInput>;

/** Query params for the paginated list endpoint. */
export interface CategoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  /**
   * Deprecated / ignored by the API (categories have no status). Retained only
   * so the Products module's category dropdown can keep calling `list(...)`
   * without changes.
   */
  status?: CategoryStatus;
}
