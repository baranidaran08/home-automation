'use client';

import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PermissionGate } from '@/components/shared/permission-gate';
import { MODULES, ACTIONS } from '@/constants/permissions';

interface UserToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
}

/** Search bar + (permission-gated) Add button above the users table. */
export function UserToolbar({ search, onSearchChange, onAdd }: UserToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative sm:max-w-xs sm:flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search users…"
          className="pl-9"
          aria-label="Search users"
        />
      </div>

      <PermissionGate module={MODULES.USERS} action={ACTIONS.CREATE}>
        <Button onClick={onAdd} className="sm:w-auto">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </PermissionGate>
    </div>
  );
}
