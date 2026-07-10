import type { Metadata } from 'next';
import { CategoryManagement } from '@/features/category';

export const metadata: Metadata = { title: 'Categories' };

/**
 * /dashboard/categories — Category Management. Rendered inside the dashboard
 * layout (AuthGuard + shell). All logic lives in the CategoryManagement
 * feature component.
 */
export default function CategoriesPage() {
  return <CategoryManagement />;
}
