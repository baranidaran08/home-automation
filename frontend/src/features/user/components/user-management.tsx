'use client';

import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { UserToolbar } from './user-toolbar';
import { UserTable } from './user-table';
import { UserFormDialog } from './user-form-dialog';
import { ViewUserDialog } from './view-user-dialog';
import { TablePagination } from '@/components/shared/table-pagination';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useUsers } from '../hooks/use-users';
import { useUserMutations } from '../hooks/use-user-mutations';
import type { User } from '@/types/rbac';

const PAGE_SIZE = 10;

/**
 * Users Management screen: search + pagination + add/edit/view/delete dialogs.
 * Mirrors the Category Management pattern; data + mutations live in hooks.
 */
export function UserManagement() {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [viewing, setViewing] = useState<User | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching } = useUsers({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const users = data?.data ?? [];
  const meta = data?.meta ?? { page, limit: PAGE_SIZE, total: 0, totalPages: 0 };

  useEffect(() => {
    if (meta.totalPages > 0 && page > meta.totalPages) {
      setPage(meta.totalPages);
    }
  }, [meta.totalPages, page]);

  const { remove } = useUserMutations();

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const handleEdit = (user: User) => {
    setEditing(user);
    setFormOpen(true);
  };
  const handleView = (user: User) => {
    setViewing(user);
    setViewOpen(true);
  };
  const handleDelete = (user: User) => {
    setDeleteTarget(user);
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
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          Manage accounts and assign each user a role that defines what they can do.
        </p>
      </div>

      <UserToolbar search={searchInput} onSearchChange={setSearchInput} onAdd={handleAdd} />

      <UserTable
        users={users}
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

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} user={editing} />
      <ViewUserDialog open={viewOpen} onOpenChange={setViewOpen} user={viewing} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete user?"
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
