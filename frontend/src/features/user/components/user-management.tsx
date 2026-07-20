'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { UserToolbar } from './user-toolbar';
import { UserTable } from './user-table';
import { UserFormDialog } from './user-form-dialog';
import { UserViewDialog } from './user-view-dialog';
import { TablePagination } from '@/components/shared/table-pagination';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Rise } from '@/components/shared/rise';
import { useUsers } from '../hooks/use-users';
import { useUserMutations } from '../hooks/use-user-mutations';
import { ROUTES } from '@/constants/routes';
import type { User } from '@/types/rbac';

const PAGE_SIZE = 10;

/**
 * Users Management screen: search + pagination + add/edit/view/delete dialogs.
 * Mirrors the Category Management pattern; data + mutations live in hooks.
 */
export function UserManagement() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);
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
  // Edit navigates to the User Details page — the single place users are edited.
  const handleEdit = (user: User) => {
    router.push(ROUTES.dashboard.userDetails(user._id));
  };
  // View opens a read-only modal (no navigation) for a quick look at the record.
  const handleView = (user: User) => {
    setViewUser(user);
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
      <Rise index={0}>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          Manage accounts and assign each user a role that defines what they can do.
        </p>
      </Rise>

      <Rise index={1}>
        <UserToolbar search={searchInput} onSearchChange={setSearchInput} onAdd={handleAdd} />
      </Rise>

      <Rise index={2}>
        <UserTable
          users={users}
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

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} user={editing} />
      <UserViewDialog open={viewOpen} onOpenChange={setViewOpen} user={viewUser} />
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
