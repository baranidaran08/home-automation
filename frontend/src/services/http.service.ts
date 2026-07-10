import { apiClient } from '@/lib/axios';
import type { ApiResponse } from '@/types';
import type { AxiosRequestConfig } from 'axios';

/**
 * Thin typed wrapper over the Axios client that unwraps the backend's
 * `{ success, message, data }` envelope and returns just `data`. Feature
 * services (products, templates, quotations, …) build on top of this instead
 * of touching axios directly.
 */
export const httpService = {
  async get<TData>(url: string, config?: AxiosRequestConfig): Promise<TData> {
    const res = await apiClient.get<ApiResponse<TData>>(url, config);
    return res.data.data;
  },

  async post<TData, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig
  ): Promise<TData> {
    const res = await apiClient.post<ApiResponse<TData>>(url, body, config);
    return res.data.data;
  },

  async put<TData, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig
  ): Promise<TData> {
    const res = await apiClient.put<ApiResponse<TData>>(url, body, config);
    return res.data.data;
  },

  async patch<TData, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig
  ): Promise<TData> {
    const res = await apiClient.patch<ApiResponse<TData>>(url, body, config);
    return res.data.data;
  },

  async delete<TData>(url: string, config?: AxiosRequestConfig): Promise<TData> {
    const res = await apiClient.delete<ApiResponse<TData>>(url, config);
    return res.data.data;
  },

  /** Full envelope (including `meta`) for list endpoints that need pagination. */
  async getWithMeta<TData>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<TData>> {
    const res = await apiClient.get<ApiResponse<TData>>(url, config);
    return res.data;
  },

  /**
   * Multipart POST/PATCH for file uploads.
   *
   * IMPORTANT: the axios instance sets a default `Content-Type: application/json`
   * (see lib/axios.ts). Without overriding it here, axios v1's `transformRequest`
   * would serialise the FormData to JSON (`formDataToJSON`), silently dropping
   * every File — the request would go out as JSON with no files, so multer would
   * receive `req.files = []` and nothing would reach Cloudinary.
   *
   * Setting `multipart/form-data` keeps the body as FormData; axios/the browser
   * then replaces it with the real `multipart/form-data; boundary=…` header.
   */
  async postForm<TData>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<TData> {
    const res = await apiClient.post<ApiResponse<TData>>(url, formData, {
      ...config,
      headers: { ...config?.headers, 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  async patchForm<TData>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<TData> {
    const res = await apiClient.patch<ApiResponse<TData>>(url, formData, {
      ...config,
      headers: { ...config?.headers, 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
};
