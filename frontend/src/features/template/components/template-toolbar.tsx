'use client';

import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategoryOptions } from '@/features/product';
import { PermissionGate } from '@/components/shared/permission-gate';
import { MODULES, ACTIONS } from '@/constants/permissions';

export const ALL = 'all';

interface TemplateToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string; // category id or ALL
  onCategoryChange: (value: string) => void;
  onAdd: () => void;
}

/** Search + Category filter + Upload button above the template table. */
export function TemplateToolbar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  onAdd,
}: TemplateToolbarProps) {
  const { data: categories = [] } = useCategoryOptions();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search templates…"
            className="pl-9"
            aria-label="Search templates"
          />
        </div>

        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="sm:w-48" aria-label="Filter by category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <PermissionGate module={MODULES.TEMPLATES} action={ACTIONS.CREATE}>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Upload Template
        </Button>
      </PermissionGate>
    </div>
  );
}
