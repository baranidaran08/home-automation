'use client';

import { useCategoryOptions } from '@/features/product';
import { CategoryProductsPanel } from '../category-products-panel';
import type { QuotationWizardState } from '../../hooks/use-quotation-wizard';

/**
 * Step 3 — one products panel per selected category. Each panel carries its own
 * Service Charge (every category is a separate service).
 */
export function StepProducts({ wizard }: { wizard: QuotationWizardState }) {
  const { data: categories = [] } = useCategoryOptions();
  const nameById = new Map(categories.map((c) => [c.value, c.label]));

  return (
    <div className="space-y-4">
      {wizard.selectedCategoryIds.map((categoryId) => (
        <CategoryProductsPanel
          key={categoryId}
          categoryId={categoryId}
          categoryName={nameById.get(categoryId) ?? 'Category'}
          wizard={wizard}
        />
      ))}
    </div>
  );
}
