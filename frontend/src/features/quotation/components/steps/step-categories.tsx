'use client';

import { Check, FolderTree } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategoryOptions } from '@/features/product';
import type { QuotationWizardState } from '../../hooks/use-quotation-wizard';

/** Step 2 — select one or more categories. */
export function StepCategories({ wizard }: { wizard: QuotationWizardState }) {
  const { data: categories = [], isLoading } = useCategoryOptions();
  const { selectedCategoryIds, toggleCategory } = wizard;

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return <p className="text-sm text-muted-foreground">No categories available. Create one first.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((cat) => {
        const selected = selectedCategoryIds.includes(cat.value);
        return (
          <button
            key={cat.value}
            type="button"
            onClick={() => toggleCategory(cat.value)}
            className={cn(
              'flex items-center justify-between gap-3 rounded-lg border p-4 text-left transition-colors',
              selected ? 'border-primary bg-primary/5' : 'hover:bg-accent'
            )}
          >
            <span className="flex items-center gap-3">
              <FolderTree className="h-5 w-5 text-muted-foreground" aria-hidden />
              <span className="font-medium">{cat.label}</span>
            </span>
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full border',
                selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40'
              )}
            >
              {selected && <Check className="h-3.5 w-3.5" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
