import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CategoryManagement } from '@/features/category';
import { RequirePermission } from '@/components/shared/require-permission';
import { FullPageLoader } from '@/components/shared/full-page-loader';
import { MODULES } from '@/constants/permissions';

export const metadata: Metadata = { title: 'Categories' };

/**
 * /dashboard/categories — Category Management. Wrapped in RequirePermission so
 * direct-URL access is blocked for users without `categories:read`. The Suspense
 * boundary is required because the management component reads pagination/search
 * from the URL via useSearchParams.
 */
export default function CategoriesPage() {
  return (
    <RequirePermission module={MODULES.CATEGORIES}>
      <Suspense fallback={<FullPageLoader />}>
        <CategoryManagement />
      </Suspense>
    </RequirePermission>
  );
}
