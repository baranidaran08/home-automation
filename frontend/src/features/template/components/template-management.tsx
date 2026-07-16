'use client';

import { useEffect, useState } from 'react';
import { useTableUrlState } from '@/hooks/use-table-url-state';
import { TemplateToolbar, ALL } from './template-toolbar';
import { TemplateTable } from './template-table';
import { TemplateFormDialog } from './template-form-dialog';
import { ViewTemplateDialog } from './view-template-dialog';
import { TablePagination } from '@/components/shared/table-pagination';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Rise } from '@/components/shared/rise';
import { useTemplates } from '../hooks/use-templates';
import { useTemplateMutations } from '../hooks/use-template-mutations';
import type { Template } from '@/types/template';

const PAGE_SIZE = 10;

// The category filter is synced to the URL; ALL means "no filter" (omitted).
const TEMPLATE_FILTERS = [{ key: 'category', defaultValue: ALL }];

/**
 * Template Management screen: orchestrates search/filter/pagination state and
 * the upload/edit/view/delete dialogs. Page, search and category all live in
 * the URL (via useTableUrlState). Fetching and mutations live in hooks.
 */
export function TemplateManagement() {
  const { page, search, searchInput, setSearchInput, filters, setPage, setFilter } =
    useTableUrlState({ filters: TEMPLATE_FILTERS });
  const category = filters.category ?? ALL;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [viewing, setViewing] = useState<Template | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading, isFetching } = useTemplates({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    category: category === ALL ? undefined : category,
  });

  const templates = data?.data ?? [];
  const meta = data?.meta ?? { page, limit: PAGE_SIZE, total: 0, totalPages: 0 };

  useEffect(() => {
    if (meta.totalPages > 0 && page > meta.totalPages) setPage(meta.totalPages, { replace: true });
  }, [meta.totalPages, page, setPage]);

  const { remove } = useTemplateMutations();

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const handleEdit = (template: Template) => {
    setEditing(template);
    setFormOpen(true);
  };
  const handleView = (template: Template) => {
    setViewing(template);
    setViewOpen(true);
  };
  const handleDelete = (template: Template) => {
    setDeleteTarget(template);
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
      <Rise index={0}>
        <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
        <p className="text-sm text-muted-foreground">
          Word (.docx) quotation templates — one per category. Used to generate quotations later.
        </p>
      </Rise>

      <Rise index={1}>
        <TemplateToolbar
          search={searchInput}
          onSearchChange={setSearchInput}
          category={category}
          onCategoryChange={(v) => setFilter('category', v)}
          onAdd={handleAdd}
        />
      </Rise>

      <Rise index={2}>
        <TemplateTable
          templates={templates}
          isLoading={isLoading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Rise>

      <Rise index={3}>
        <TablePagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          onPageChange={setPage}
          isFetching={isFetching}
        />
      </Rise>

      <TemplateFormDialog open={formOpen} onOpenChange={setFormOpen} template={editing} />
      <ViewTemplateDialog open={viewOpen} onOpenChange={setViewOpen} template={viewing} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete template?"
        description={
          deleteTarget
            ? `"${deleteTarget.templateName}" and its file will be permanently deleted. This cannot be undone.`
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
