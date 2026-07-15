'use client';

import { useEffect, useState } from 'react';
import { useTableUrlState } from '@/hooks/use-table-url-state';
import { ProductToolbar, ALL, type ProductFilters } from './product-toolbar';
import { ProductGrid } from './product-grid';
import { ProductFormDialog } from './product-form-dialog';
import { ViewProductDialog } from './view-product-dialog';
import { TablePagination } from '@/components/shared/table-pagination';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useProducts } from '../hooks/use-products';
import { useProductMutations } from '../hooks/use-product-mutations';
import type { Product, ProductStatus } from '@/types/product';

const PAGE_SIZE = 10;

// Filters synced to the URL. Their "no filter" value (ALL) is omitted from the
// query string, so ?category=... only appears when an actual filter is applied.
const PRODUCT_FILTERS = [
  { key: 'category', defaultValue: ALL },
  { key: 'brand', defaultValue: ALL },
  { key: 'status', defaultValue: ALL },
];

/**
 * Product Management screen: orchestrates search/filter/pagination state and
 * the add/edit/view/delete dialogs. Page, search, category, brand and status
 * all live in the URL (via useTableUrlState) — so refresh, deep links, and
 * Back/Forward all work. Fetching and mutations live in hooks (unchanged).
 */
export function ProductManagement() {
  const { page, search, searchInput, setSearchInput, filters, setPage, setFilter } =
    useTableUrlState({ filters: PRODUCT_FILTERS });

  // Committed filter values from the URL (default to ALL when absent).
  const category = filters.category ?? ALL;
  const brand = filters.brand ?? ALL;
  const status = filters.status ?? ALL;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [viewing, setViewing] = useState<Product | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading, isFetching } = useProducts({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    category: category === ALL ? undefined : category,
    brand: brand === ALL ? undefined : brand,
    status: status === ALL ? undefined : (status as ProductStatus),
  });

  const products = data?.data ?? [];
  const meta = data?.meta ?? { page, limit: PAGE_SIZE, total: 0, totalPages: 0 };

  useEffect(() => {
    if (meta.totalPages > 0 && page > meta.totalPages) setPage(meta.totalPages, { replace: true });
  }, [meta.totalPages, page, setPage]);

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

  // Shape the toolbar's controlled value from URL state. `search` uses the live
  // input (snappy typing); the filters use the committed URL values.
  const toolbarFilters: ProductFilters = {
    search: searchInput,
    category,
    brand,
    status: status as ProductFilters['status'],
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-sm text-muted-foreground">
          Manage inventory. Each product belongs to one category.
        </p>
      </div>

      <ProductToolbar
        filters={toolbarFilters}
        onSearchChange={setSearchInput}
        onCategoryChange={(v) => setFilter('category', v)}
        onBrandChange={(v) => setFilter('brand', v)}
        onStatusChange={(v) => setFilter('status', v)}
        onAdd={handleAdd}
      />

      <ProductGrid
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
