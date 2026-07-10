import type { Metadata } from 'next';
import { QuotationWizard } from '@/features/quotation';

export const metadata: Metadata = { title: 'Quotation' };

/**
 * /dashboard/quotations — Generate Quotation wizard. Rendered inside the
 * dashboard layout (AuthGuard + shell). Logic lives in the feature component.
 */
export default function QuotationPage() {
  return <QuotationWizard />;
}
