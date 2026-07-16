'use client';

import { Pencil, Trash2, Package, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/status-badge';
import { PermissionGate } from '@/components/shared/permission-gate';
import { MODULES, ACTIONS } from '@/constants/permissions';
import { formatCurrency } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const SKELETON_CARDS = 8;

/**
 * Responsive grid. Phones get 2 compact columns (a single full-width column made
 * each card ~a screen tall, so scanning the catalogue meant endless scrolling);
 * it opens up to 3–4 roomy columns from `lg` where the reference layout applies.
 */
const GRID = 'grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4';

/** Media box ratio — shorter on phones so 2-up cards stay compact. */
const MEDIA = 'relative aspect-[4/3] overflow-hidden bg-secondary/60';

function ProductCard({
  product,
  onView,
  onEdit,
  onDelete,
}: { product: Product } & Pick<ProductGridProps, 'onView' | 'onEdit' | 'onDelete'>) {
  const image = product.images?.[0];
  const outOfStock = product.stock === 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-float">
      {/* The whole card opens the product details. An invisible button covering
          the card (rather than onClick on the article) keeps this a real,
          keyboard-focusable control; edit/delete sit above it on z-20 so they
          receive their own clicks. */}
      <button
        type="button"
        onClick={() => onView(product)}
        aria-label={`View ${product.productName}`}
        className="absolute inset-0 z-10 cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      {/* Media */}
      <div className={MEDIA}>
        {image ? (
          // `object-contain` + padding keeps studio/catalogue shots whole (nothing
          // clipped) instead of cropping them to fill the frame.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.secureUrl}
            alt={product.productName}
            className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageOff className="h-8 w-8 text-muted-foreground/50" aria-hidden />
          </div>
        )}

        <div className="absolute left-2 top-2 sm:left-3 sm:top-3">
          <StatusBadge status={product.status} />
        </div>

        {/* Actions: always visible on touch; revealed on hover/keyboard focus on desktop.
            Stacked vertically on phones — in the 2-up grid a card is only ~173px
            wide, so a horizontal row (~98px) plus the status badge (~92px) would
            overrun the card and collide. From `sm` up there is room for a row. */}
        <div className="absolute right-1.5 top-1.5 z-20 flex flex-col items-center gap-1 transition-opacity duration-200 sm:right-2 sm:top-2 sm:flex-row sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <PermissionGate module={MODULES.PRODUCTS} action={ACTIONS.UPDATE}>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 bg-card/90 backdrop-blur sm:h-8 sm:w-8"
              onClick={() => onEdit(product)}
              aria-label={`Edit ${product.productName}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </PermissionGate>
          <PermissionGate module={MODULES.PRODUCTS} action={ACTIONS.DELETE}>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 bg-card/90 text-destructive backdrop-blur hover:text-destructive sm:h-8 sm:w-8"
              onClick={() => onDelete(product)}
              aria-label={`Delete ${product.productName}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {product.category?.categoryName && (
          <p className="mb-1 truncate text-[11px] font-medium text-primary sm:text-xs">
            {product.category.categoryName}
          </p>
        )}
        <h3
          className="truncate text-sm font-semibold leading-tight sm:text-base"
          title={product.productName}
        >
          {product.productName}
        </h3>
        <p className="mt-1 truncate text-xs text-muted-foreground sm:text-sm">
          {[product.brand, product.modelNumber].filter(Boolean).join(' · ') || '—'}
        </p>

        {/* Stacks on narrow 2-up cards, sits on one line once there's room. */}
        <div className="mt-auto flex flex-col gap-0.5 pt-3 sm:flex-row sm:items-end sm:justify-between sm:gap-2 sm:pt-4">
          <span className="text-base font-bold text-primary sm:text-lg">
            {formatCurrency(product.price)}
          </span>
          <span
            className={cn(
              'text-[11px] font-medium sm:text-xs',
              outOfStock ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {outOfStock ? 'Out of stock' : `${product.stock} Units Left`}
          </span>
        </div>
      </div>
    </article>
  );
}

/** Product card grid with loading skeletons and an empty state. */
export function ProductGrid({ products, isLoading, onView, onEdit, onDelete }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className={GRID}>
        {Array.from({ length: SKELETON_CARDS }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border/70 bg-card">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="space-y-2 p-3 sm:p-4">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/70 bg-card py-20 text-center text-muted-foreground shadow-card">
        <Package className="h-8 w-8" aria-hidden />
        <p className="text-sm font-medium">No products found</p>
        <p className="text-xs">Try adjusting filters or add a new product.</p>
      </div>
    );
  }

  return (
    <div className={GRID}>
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
