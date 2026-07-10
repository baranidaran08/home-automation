'use client';

import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { ProductToolbar, ALL, type ProductFilters } from './product-toolbar';
import { ProductTable } from './product-table';
import { ProductFormDialog } from './product-form-dialog';
import { ViewProductDialog } from './view-product-dialog';
import { TablePagination } from '@/components/shared/table-pagination';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useProducts } from '../hooks/use-products';
import { useProductMutations } from '../hooks/use-product-mutations';
import type { Product } from '@/types/product';

const PAGE_SIZE = 10;

const DEFAULT_FILTERS: ProductFilters = {
  search: '',
  category: ALL,
  brand: ALL,
  status: ALL,
};

/**
 * Product Management screen: orchestrates search/filter/pagination state and
 * the add/edit/view/delete dialogs. Fetching and mutations live in hooks.
 */
export function ProductManagement() {
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);
  const debouncedSearch = useDebounce(filters.search, 400);
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [viewing, setViewing] = useState<Product | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Reset to page 1 whenever the query changes.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.category, filters.brand, filters.status]);

  const { data, isLoading, isFetching } = useProducts({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    category: filters.category === ALL ? undefined : filters.category,
    brand: filters.brand === ALL ? undefined : filters.brand,
    status: filters.status === ALL ? undefined : filters.status,
  });

  const products = data?.data ?? [];
  const meta = data?.meta ?? { page, limit: PAGE_SIZE, total: 0, totalPages: 0 };

  useEffect(() => {
    if (meta.totalPages > 0 && page > meta.totalPages) setPage(meta.totalPages);
  }, [meta.totalPages, page]);

  const { remove } = useProductMutations();

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const handleEdit = (product: Product) => {
    setEditing(product);
    setFormOpen(true);
  };
  const handleView = (product: Product) => {
    setViewing(product);
    setViewOpen(true);
  };
  const handleDelete = (product: Product) => {
    setDeleteTarget(product);
    setDeleteOpen(true);
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await remove.mutateAsync(deleteTarget._id);
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch {
      // toast handled in the mutation hook
    }
  };

  const patch = (part: Partial<ProductFilters>) => setFilters((f) => ({ ...f, ...part }));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <p className="text-sm text-muted-foreground">
          Manage inventory. Each product belongs to one category.
        </p>
      </div>

      <ProductToolbar
        filters={filters}
        onSearchChange={(v) => patch({ search: v })}
        onCategoryChange={(v) => patch({ category: v })}
        onBrandChange={(v) => patch({ brand: v })}
        onStatusChange={(v) => patch({ status: v })}
        onAdd={handleAdd}
      />

      <ProductTable
        products={products}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <TablePagination
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        onPageChange={setPage}
        isFetching={isFetching}
      />

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editing} />
      <ViewProductDialog open={viewOpen} onOpenChange={setViewOpen} product={viewing} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete product?"
        description={
          deleteTarget
            ? `"${deleteTarget.productName}" and its images will be permanently deleted. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        loading={remove.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
