import type { Metadata } from 'next';
import { QuotationWizard } from '@/features/quotation';
import { RequirePermission } from '@/components/shared/require-permission';
import { Rise } from '@/components/shared/rise';
import { MODULES, ACTIONS } from '@/constants/permissions';

export const metadata: Metadata = { title: 'Quotation' };

/**
 * /dashboard/quotations — Generate Quotation wizard. Wrapped in RequirePermission
 * so only users who can create quotations reach the generator. The wizard rises
 * in as one unit — its internal steps manage their own transitions.
 */
export default function QuotationPage() {
  return (
    <RequirePermission module={MODULES.QUOTATIONS} action={ACTIONS.CREATE}>
      <Rise>
        <QuotationWizard />
      </Rise>
    </RequirePermission>
  );
}
