import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProductManagement } from '@/features/product';
import { RequirePermission } from '@/components/shared/require-permission';
import { FullPageLoader } from '@/components/shared/full-page-loader';
import { MODULES } from '@/constants/permissions';

export const metadata: Metadata = { title: 'Products' };

/**
 * /dashboard/products — Product (Inventory) management. Wrapped in
 * RequirePermission so direct-URL access is blocked without `products:read`. The
 * Suspense boundary is required because the management component reads
 * pagination/search/filters from the URL via useSearchParams.
 */
export default function ProductsPage() {
  return (
    <RequirePermission module={MODULES.PRODUCTS}>
      <Suspense fallback={<FullPageLoader />}>
        <ProductManagement />
      </Suspense>
    </RequirePermission>
  );
}
