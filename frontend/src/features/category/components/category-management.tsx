'use client';

import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { CategoryToolbar } from './category-toolbar';
import { CategoryTable } from './category-table';
import { CategoryFormDialog } from './category-form-dialog';
import { ViewCategoryDialog } from './view-category-dialog';
import { TablePagination } from '@/components/shared/table-pagination';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useCategories } from '../hooks/use-categories';
import { useCategoryMutations } from '../hooks/use-category-mutations';
import type { Category } from '@/types/category';

const PAGE_SIZE = 10;

/**
 * Category Management screen: orchestrates search/filter/pagination state and
 * the add/edit/view/delete dialogs. Data fetching and mutations live in hooks;
 * this component wires UI to them.
 */
export function CategoryManagement() {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [viewing, setViewing] = useState<Category | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Reset to the first page whenever the query changes.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching } = useCategories({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const categories = data?.data ?? [];
  const meta = data?.meta ?? { page, limit: PAGE_SIZE, total: 0, totalPages: 0 };

  // If the current page becomes empty after a delete, step back a page.
  useEffect(() => {
    if (meta.totalPages > 0 && page > meta.totalPages) {
      setPage(meta.totalPages);
    }
  }, [meta.totalPages, page]);

  const { remove } = useCategoryMutations();

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const handleEdit = (category: Category) => {
    setEditing(category);
    setFormOpen(true);
  };
  const handleView = (category: Category) => {
    setViewing(category);
    setViewOpen(true);
  };
  const handleDelete = (category: Category) => {
    setDeleteTarget(category);
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

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Manage home automation fields. Products and templates will belong to these categories.
        </p>
      </div>

      <CategoryToolbar search={searchInput} onSearchChange={setSearchInput} onAdd={handleAdd} />

      <CategoryTable
        categories={categories}
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

      <CategoryFormDialog open={formOpen} onOpenChange={setFormOpen} category={editing} />
      <ViewCategoryDialog open={viewOpen} onOpenChange={setViewOpen} category={viewing} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete category?"
        description={
          deleteTarget
            ? `"${deleteTarget.categoryName}" will be permanently deleted. This action cannot be undone.`
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
