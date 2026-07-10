'use client';

import { ImageOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatCurrency, formatDate } from '@/utils/format';
import type { Product } from '@/types/product';

interface ViewProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

/** Read-only product details with an image gallery. */
export function ViewProductDialog({ open, onOpenChange, product }: ViewProductDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product?.productName ?? 'Product'}</DialogTitle>
          <DialogDescription>{product?.category?.categoryName}</DialogDescription>
        </DialogHeader>

        {product && (
          <div className="space-y-5">
            {/* Gallery */}
            {product.images.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {product.images.map((img) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={img.publicId}
                    src={img.secureUrl}
                    alt={product.productName}
                    className="aspect-square w-full rounded-md border object-cover"
                  />
                ))}
              </div>
            ) : (
              <div className="flex h-28 flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground">
                <ImageOff className="h-6 w-6" aria-hidden />
                <span className="text-xs">No images</span>
              </div>
            )}

            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Price">{formatCurrency(product.price)}</Field>
              <Field label="Stock">{product.stock}</Field>
              <Field label="Status">
                <StatusBadge status={product.status} />
              </Field>
              <Field label="Brand">{product.brand || '—'}</Field>
              <Field label="Model">{product.modelNumber || '—'}</Field>
              <Field label="Warranty">{product.warranty || '—'}</Field>
            </dl>

            <div className="space-y-3">
              <Field label="Description">
                <p className="whitespace-pre-line">{product.description || '—'}</p>
              </Field>
              <Field label="Specifications">
                <p className="whitespace-pre-line">{product.specifications || '—'}</p>
              </Field>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-1 border-t pt-3 text-xs text-muted-foreground">
              <span>Created {formatDate(product.createdAt)}</span>
              <span>Updated {formatDate(product.updatedAt)}</span>
              <span>
                Slug: <code className="rounded bg-muted px-1">{product.slug}</code>
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
