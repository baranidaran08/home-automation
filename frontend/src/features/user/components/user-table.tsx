'use client';

import { Eye, Pencil, Trash2, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PermissionGate } from '@/components/shared/permission-gate';
import { MODULES, ACTIONS } from '@/constants/permissions';
import { useAuthStore } from '@/store/auth.store';
import { formatDate } from '@/utils/format';
import type { User } from '@/types/rbac';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const COLUMN_COUNT = 5;
const SKELETON_ROWS = 5;

/** Users table with role badge. Edit/Delete are permission-gated. */
export function UserTable({ users, isLoading, onView, onEdit, onDelete }: UserTableProps) {
  // The Root Super Admin is protected: it can never be deleted, and only its
  // owner may edit it. We hide those actions here for usability — the backend
  // still enforces all of it and returns 403 regardless.
  const currentUserId = useAuthStore((s) => s.user?._id);

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell">Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="hidden md:table-cell">Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: COLUMN_COUNT }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-5 w-full max-w-[140px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} className="h-40">
                <div className="flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                  <Users className="h-8 w-8" aria-hidden />
                  <p className="text-sm font-medium">No users found.</p>
                  <p className="text-xs">{"Click 'Add User' to create one."}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
              const isRoot = Boolean(user.isRoot);
              const isSelf = currentUserId === user._id;
              return (
              <TableRow key={user._id}>
                <TableCell className="font-medium">
                  <span className="flex items-center gap-2">
                    {user.name}
                    {isRoot && (
                      <Badge variant="outline" className="text-[10px] font-normal">
                        Root
                      </Badge>
                    )}
                  </span>
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {user.email}
                </TableCell>
                <TableCell>
                  <Badge variant={user.role?.isSuperAdmin ? 'default' : 'secondary'}>
                    {user.role?.name ?? '—'}
                  </Badge>
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {formatDate(user.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(user)}
                      aria-label={`View ${user.name}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {/* Root can only be edited by its owner. */}
                    {(!isRoot || isSelf) && (
                      <PermissionGate module={MODULES.USERS} action={ACTIONS.UPDATE}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(user)}
                          aria-label={`Edit ${user.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </PermissionGate>
                    )}
                    {/* Root can never be deleted. */}
                    {!isRoot && (
                      <PermissionGate module={MODULES.USERS} action={ACTIONS.DELETE}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(user)}
                          aria-label={`Delete ${user.name}`}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </PermissionGate>
                    )}
                  </div>
                </TableCell>
              </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
