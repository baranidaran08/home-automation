export type QuotationStatus = 'draft' | 'generated' | 'failed';

export interface QuotationItem {
  product: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface QuotationCategoryTotal {
  category: string;
  categoryName: string;
  productTotal: number;
  serviceCharge: number;
  serviceTotal: number;
}

export interface QuotationCategoryRef {
  _id: string;
  categoryName: string;
  slug: string;
}

export interface QuotationPdf {
  publicId: string;
  secureUrl: string;
}

/** A quotation as returned by the API. */
export interface Quotation {
  _id: string;
  quotationNumber: string;
  quotationDate: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  projectName: string;
  projectLocation: string;
  categories: QuotationCategoryRef[];
  items: QuotationItem[];
  categoryTotals: QuotationCategoryTotal[];
  grandTotal: number;
  productTotal: number;
  serviceCharge: number;
  serviceTotal: number;
  pdf?: QuotationPdf;
  status: QuotationStatus;
  createdAt: string;
  updatedAt: string;
}

/** Payload for creating/updating a quotation (prices are computed server-side). */
export interface CreateQuotationInput {
  customerName: string;
  phone?: string;
  email?: string;
  address?: string;
  projectName?: string;
  projectLocation?: string;
  items: { productId: string; quantity: number }[];
  serviceCharges?: Record<string, number>;
}
