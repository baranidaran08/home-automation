import type { AxiosProgressEvent } from 'axios';
import { httpService } from './http.service';
import { env } from '@/constants/env';
import type { ApiResponse } from '@/types/api';
import type { Template, TemplateListParams } from '@/types/template';

const BASE = '/templates';

/**
 * Template API calls. Create/replace send `multipart/form-data` (a single Word
 * .docx file plus fields) and accept an upload-progress callback.
 */
export const templateService = {
  list: (params: TemplateListParams = {}): Promise<ApiResponse<Template[]>> =>
    httpService.getWithMeta<Template[]>(BASE, { params }),

  getById: (id: string) => httpService.get<Template>(`${BASE}/${id}`),

  create: (formData: FormData, onUploadProgress?: (e: AxiosProgressEvent) => void) =>
    httpService.postForm<Template>(BASE, formData, { onUploadProgress }),

  update: (id: string, formData: FormData, onUploadProgress?: (e: AxiosProgressEvent) => void) =>
    httpService.patchForm<Template>(`${BASE}/${id}`, formData, { onUploadProgress }),

  remove: (id: string) => httpService.delete<{ id: string }>(`${BASE}/${id}`),

  /** Backend download endpoint (302-redirects to a Cloudinary attachment URL). */
  downloadHref: (id: string) => `${env.apiBaseUrl}${BASE}/${id}/download`,
};
