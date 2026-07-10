/**
 * Shared API contract types. These mirror the backend's ApiResponse / error
 * envelope so both ends agree on the wire format.
 */

/** Standard success envelope returned by every backend endpoint. */
export interface ApiResponse<TData = unknown> {
  success: true;
  message: string;
  data: TData;
  meta?: PaginationMeta;
}

/** Standard error envelope returned by the backend's global error handler. */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: FieldError[];
  stack?: string;
}

export interface FieldError {
  path: string;
  message: string;
}

/** Pagination metadata for list endpoints. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Common query params for paginated/sorted/searchable list endpoints. */
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}
