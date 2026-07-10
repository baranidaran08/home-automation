'use client';

import { FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/utils/format';
import { useCategoryTemplates } from '../../hooks/use-category-templates';
import type { QuotationWizardState } from '../../hooks/use-quotation-wizard';

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value || '—'}</dd>
    </div>
  );
}

/** Step 4 — review everything before generating, incl. auto-detected templates. */
export function StepPreview({ wizard }: { wizard: QuotationWizardState }) {
  const { customer, categoryTotals, grandTotal, selectionList } = wizard;
  const { byCategoryId } = useCategoryTemplates();

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Detail label="Customer" value={customer.customerName} />
            <Detail label="Phone" value={customer.phone} />
            <Detail label="Email" value={customer.email} />
            <Detail label="Project" value={customer.projectName} />
            <Detail label="Location" value={customer.projectLocation} />
            <Detail label="Address" value={customer.address} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detected Word Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {categoryTotals.map((c) => {
            const tpl = byCategoryId.get(c.categoryId);
            return (
              <div key={c.categoryId} className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium">{c.categoryName}</span>
                {tpl ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <FileText className="h-4 w-4" />
                    {tpl.originalFileName || tpl.templateName}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    No template — generation will fail
                  </span>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {categoryTotals.map((c) => {
        const items = selectionList.filter((s) => s.product.categoryId === c.categoryId);
        return (
          <Card key={c.categoryId}>
            <CardHeader className="flex-row items-center justify-between gap-3">
              <CardTitle className="text-base">{c.categoryName}</CardTitle>
              <Badge variant="secondary">{formatCurrency(c.serviceTotal)}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((s) => (
                    <TableRow key={s.product._id}>
                      <TableCell className="font-medium">{s.product.productName}</TableCell>
                      <TableCell className="text-center">{s.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(s.product.price)}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(s.product.price * s.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="ml-auto max-w-xs space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Product Total</span>
                  <span className="font-medium">{formatCurrency(c.productTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Service Charge</span>
                  <span className="font-medium">{formatCurrency(c.serviceCharge)}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-1">
                  <span className="font-semibold">Service Total</span>
                  <span className="font-bold">{formatCurrency(c.serviceTotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="flex items-center justify-end gap-3 rounded-lg border bg-muted/40 p-4">
        <span className="text-sm font-semibold">Grand Total</span>
        <span className="text-xl font-bold">{formatCurrency(grandTotal)}</span>
      </div>
    </div>
  );
}
