'use client';

import { Eye, Pencil, Trash2, Package, ImageOff } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatCurrency } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const COLUMN_COUNT = 9;
const SKELETON_ROWS = 5;

function Thumb({ product }: { product: Product }) {
  const first = product.images?.[0];
  return (
    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border bg-muted">
      {first ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={first.secureUrl} alt={product.productName} className="h-full w-full object-cover" />
      ) : (
        <ImageOff className="h-4 w-4 text-muted-foreground" aria-hidden />
      )}
    </div>
  );
}

/** Product list table with thumbnail, loading skeleton and empty state. */
export function ProductTable({ products, isLoading, onView, onEdit, onDelete }: ProductTableProps) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">Image</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead className="hidden lg:table-cell">Category</TableHead>
            <TableHead className="hidden md:table-cell">Brand</TableHead>
            <TableHead className="hidden xl:table-cell">Model</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="hidden text-right sm:table-cell">Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: COLUMN_COUNT }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-6 w-full max-w-[120px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} className="h-40">
                <div className="flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                  <Package className="h-8 w-8" aria-hidden />
                  <p className="text-sm font-medium">No products found</p>
                  <p className="text-xs">Try adjusting filters or add a new product.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product._id}>
                <TableCell>
                  <Thumb product={product} />
                </TableCell>
                <TableCell className="font-medium">{product.productName}</TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {product.category?.categoryName ?? '—'}
                </TableCell>
                <TableCell className="hidden md:table-cell">{product.brand || '—'}</TableCell>
                <TableCell className="hidden text-muted-foreground xl:table-cell">
                  {product.modelNumber || '—'}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(product.price)}
                </TableCell>
                <TableCell className="hidden text-right sm:table-cell">
                  <span className={cn(product.stock === 0 && 'text-destructive')}>
                    {product.stock}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={product.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(product)}
                      aria-label={`View ${product.productName}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(product)}
                      aria-label={`Edit ${product.productName}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(product)}
                      aria-label={`Delete ${product.productName}`}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
