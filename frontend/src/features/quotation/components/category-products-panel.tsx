'use client';

import { useState } from 'react';
import { Minus, Plus, Search, PackageX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDebounce } from '@/hooks/use-debounce';
import { useProducts } from '@/features/product';
import { formatCurrency } from '@/utils/format';
import type { QuotationWizardState, WizardProduct } from '../hooks/use-quotation-wizard';

interface CategoryProductsPanelProps {
  categoryId: string;
  categoryName: string;
  wizard: QuotationWizardState;
}

/** Products of one category with search + quantity selector. Prices are read-only. */
export function CategoryProductsPanel({ categoryId, categoryName, wizard }: CategoryProductsPanelProps) {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 400);
  const { data, isLoading } = useProducts({ category: categoryId, search: debounced || undefined, limit: 50 });
  const products = data?.data ?? [];

  const setQty = (p: (typeof products)[number], quantity: number) => {
    const wp: WizardProduct = {
      _id: p._id,
      productName: p.productName,
      price: p.price,
      categoryId: p.category?._id ?? categoryId,
      categoryName: p.category?.categoryName ?? categoryName,
    };
    wizard.setQuantity(wp, quantity);
  };

  // Local text state so the per-category service charge field can be cleared.
  const [scText, setScText] = useState(
    wizard.serviceCharges[categoryId] ? String(wizard.serviceCharges[categoryId]) : ''
  );
  const onServiceChargeChange = (raw: string) => {
    setScText(raw);
    wizard.setServiceCharge(categoryId, raw === '' ? 0 : Math.max(0, parseFloat(raw) || 0));
  };

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">{categoryName}</CardTitle>
          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-8 text-center text-sm text-muted-foreground">
            <PackageX className="h-6 w-6" aria-hidden />
            No products found in this category.
          </div>
        ) : (
          products.map((p) => {
            const qty = wizard.selections[p._id]?.quantity ?? 0;
            const lineTotal = p.price * qty;
            return (
              <div
                key={p._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(p.price)}
                    {p.brand ? ` · ${p.brand}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-r-none"
                      onClick={() => setQty(p, qty - 1)}
                      disabled={qty <= 0}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <Input
                      type="number"
                      min={0}
                      value={qty}
                      onChange={(e) => setQty(p, Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="h-8 w-14 rounded-none border-x-0 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                      aria-label={`Quantity for ${p.productName}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-l-none"
                      onClick={() => setQty(p, qty + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <span className="w-24 text-right text-sm font-medium">
                    {formatCurrency(lineTotal)}
                  </span>
                </div>
              </div>
            );
          })
        )}

        <div className="mt-2 flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Label htmlFor={`sc-${categoryId}`} className="text-sm font-medium">
            Service Charge
          </Label>
          <Input
            id={`sc-${categoryId}`}
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            placeholder="0"
            value={scText}
            onChange={(e) => onServiceChargeChange(e.target.value)}
            className="sm:w-40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </CardContent>
    </Card>
  );
}
