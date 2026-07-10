import { httpService } from './http.service';
import { env } from '@/constants/env';
import type { ApiResponse } from '@/types/api';
import type { CreateQuotationInput, Quotation } from '@/types/quotation';

const BASE = '/quotations';

/** Quotation API calls (JSON). Totals/prices are computed server-side. */
export const quotationService = {
  list: (params: Record<string, unknown> = {}): Promise<ApiResponse<Quotation[]>> =>
    httpService.getWithMeta<Quotation[]>(BASE, { params }),

  getById: (id: string) => httpService.get<Quotation>(`${BASE}/${id}`),

  create: (input: CreateQuotationInput) =>
    httpService.post<Quotation, CreateQuotationInput>(BASE, input),

  update: (id: string, input: Partial<CreateQuotationInput>) =>
    httpService.patch<Quotation, Partial<CreateQuotationInput>>(`${BASE}/${id}`, input),

  /** Build the merged PDF for an existing quotation. */
  generate: (id: string) => httpService.post<Quotation>(`${BASE}/${id}/generate`),

  /** Backend download endpoint (302 → Cloudinary attachment URL). */
  downloadHref: (id: string) => `${env.apiBaseUrl}${BASE}/${id}/download`,
};
