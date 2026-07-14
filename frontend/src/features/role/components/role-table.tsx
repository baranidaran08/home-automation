'use client';

import { Eye, Pencil, Trash2, ShieldCheck } from 'lucide-react';
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
import type { Role } from '@/types/rbac';

interface RoleTableProps {
  roles: Role[];
  isLoading: boolean;
  onView: (role: Role) => void;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

const COLUMN_COUNT = 4;
const SKELETON_ROWS = 5;

/** Roles table showing permission count + system/super-admin badges. Edit/Delete
 * are permission-gated; system roles cannot be deleted (button hidden). */
export function RoleTable({ roles, isLoading, onView, onEdit, onDelete }: RoleTableProps) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead>Access</TableHead>
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
          ) : roles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} className="h-40">
                <div className="flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                  <ShieldCheck className="h-8 w-8" aria-hidden />
                  <p className="text-sm font-medium">No roles found.</p>
                  <p className="text-xs">{"Click 'Add Role' to create one."}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            roles.map((role) => (
              <TableRow key={role._id}>
                <TableCell>
                  <div className="flex items-center gap-2 font-medium">
                    {role.name}
                    {/* Protected system roles show a "System" badge (no lock icon). */}
                    {role.isSystem && (
                      <Badge variant="outline" className="text-[10px] font-normal">
                        System
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden max-w-xs truncate text-muted-foreground md:table-cell">
                  {role.description || '—'}
                </TableCell>
                <TableCell>
                  {role.isSuperAdmin ? (
                    <Badge>Full access</Badge>
                  ) : (
                    <Badge variant="secondary">
                      {role.permissions.length} permission{role.permissions.length === 1 ? '' : 's'}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(role)}
                      aria-label={`View ${role.name}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <PermissionGate module={MODULES.ROLES} action={ACTIONS.UPDATE}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(role)}
                        aria-label={`Edit ${role.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </PermissionGate>
                    {!role.isSystem && (
                      <PermissionGate module={MODULES.ROLES} action={ACTIONS.DELETE}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(role)}
                          aria-label={`Delete ${role.name}`}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </PermissionGate>
                    )}
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
