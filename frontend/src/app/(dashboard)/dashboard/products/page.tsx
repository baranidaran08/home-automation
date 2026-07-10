import type { Metadata } from 'next';
import { ProductManagement } from '@/features/product';

export const metadata: Metadata = { title: 'Products' };

/**
 * /dashboard/products — Product (Inventory) management. Rendered inside the
 * dashboard layout (AuthGuard + shell). Logic lives in the feature component.
 */
export default function ProductsPage() {
  return <ProductManagement />;
}
