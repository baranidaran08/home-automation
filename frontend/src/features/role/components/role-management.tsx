'use client';

import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { RoleToolbar } from './role-toolbar';
import { RoleTable } from './role-table';
import { RoleFormDialog } from './role-form-dialog';
import { ViewRoleDialog } from './view-role-dialog';
import { TablePagination } from '@/components/shared/table-pagination';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Rise } from '@/components/shared/rise';
import { useRoles } from '../hooks/use-roles';
import { useRoleMutations } from '../hooks/use-role-mutations';
import type { Role } from '@/types/rbac';

const PAGE_SIZE = 10;

/**
 * Roles Management screen: search + pagination + add/edit/view/delete dialogs.
 * Mirrors the Category Management pattern; data + mutations live in hooks.
 */
export function RoleManagement() {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [viewing, setViewing] = useState<Role | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching } = useRoles({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const roles = data?.data ?? [];
  const meta = data?.meta ?? { page, limit: PAGE_SIZE, total: 0, totalPages: 0 };

  useEffect(() => {
    if (meta.totalPages > 0 && page > meta.totalPages) {
      setPage(meta.totalPages);
    }
  }, [meta.totalPages, page]);

  const { remove } = useRoleMutations();

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const handleEdit = (role: Role) => {
    setEditing(role);
    setFormOpen(true);
  };
  const handleView = (role: Role) => {
    setViewing(role);
    setViewOpen(true);
  };
  const handleDelete = (role: Role) => {
    setDeleteTarget(role);
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
        <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
        <p className="text-sm text-muted-foreground">
          Define roles and the exact actions each one can perform across the system.
        </p>
      </Rise>

      <Rise index={1}>
        <RoleToolbar search={searchInput} onSearchChange={setSearchInput} onAdd={handleAdd} />
      </Rise>

      <Rise index={2}>
        <RoleTable
          roles={roles}
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

      <RoleFormDialog open={formOpen} onOpenChange={setFormOpen} role={editing} />
      <ViewRoleDialog open={viewOpen} onOpenChange={setViewOpen} role={viewing} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete role?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently deleted. This action cannot be undone.`
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
