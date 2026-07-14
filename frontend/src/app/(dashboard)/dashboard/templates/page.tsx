import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TemplateManagement } from '@/features/template';
import { RequirePermission } from '@/components/shared/require-permission';
import { FullPageLoader } from '@/components/shared/full-page-loader';
import { MODULES } from '@/constants/permissions';

export const metadata: Metadata = { title: 'Templates' };

/**
 * /dashboard/templates — Template management. Wrapped in RequirePermission so
 * direct-URL access is blocked for users without `templates:read`. The Suspense
 * boundary is required because the management component reads
 * pagination/search/filters from the URL via useSearchParams.
 */
export default function TemplatesPage() {
  return (
    <RequirePermission module={MODULES.TEMPLATES}>
      <Suspense fallback={<FullPageLoader />}>
        <TemplateManagement />
      </Suspense>
    </RequirePermission>
  );
}
