'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format';

interface CategoryTotal {
  categoryId: string;
  categoryName: string;
  productTotal: number;
  serviceCharge: number;
  serviceTotal: number;
}

interface QuotationSummaryProps {
  categoryTotals: CategoryTotal[];
  grandTotal: number;
}

function Line({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={muted ? 'text-muted-foreground' : ''}>{label}</span>
      <span className={muted ? '' : 'font-medium'}>{formatCurrency(value)}</span>
    </div>
  );
}

/** Live per-category totals (product / service charge / service total) + grand total. */
export function QuotationSummary({ categoryTotals, grandTotal }: QuotationSummaryProps) {
  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="text-base">Live Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {categoryTotals.length === 0 ? (
          <p className="text-muted-foreground">No products selected yet.</p>
        ) : (
          categoryTotals.map((c) => (
            <div key={c.categoryId} className="space-y-1.5">
              <p className="font-medium">{c.categoryName}</p>
              <Line label="Product Total" value={c.productTotal} muted />
              <Line label="Service Charge" value={c.serviceCharge} muted />
              <div className="flex items-center justify-between gap-3 border-t pt-1.5">
                <span className="text-muted-foreground">Service Total</span>
                <span className="font-semibold">{formatCurrency(c.serviceTotal)}</span>
              </div>
            </div>
          ))
        )}

        <div className="flex items-center justify-between border-t pt-3">
          <span className="font-semibold">Grand Total</span>
          <span className="text-lg font-bold">{formatCurrency(grandTotal)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
