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
import { useCategoryOptions } from '../hooks/use-category-options';
import { useBrands } from '../hooks/use-brands';
import type { ProductStatus } from '@/types/product';

export const ALL = 'all';

export interface ProductFilters {
  search: string;
  category: string; // category id or ALL
  brand: string; // brand or ALL
  status: ProductStatus | typeof ALL;
}

interface ProductToolbarProps {
  filters: ProductFilters;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onStatusChange: (value: ProductFilters['status']) => void;
  onAdd: () => void;
}

/** Search + Category/Brand/Status filters + Add button. */
export function ProductToolbar({
  filters,
  onSearchChange,
  onCategoryChange,
  onBrandChange,
  onStatusChange,
  onAdd,
}: ProductToolbarProps) {
  const { data: categories = [] } = useCategoryOptions();
  const { data: brands = [] } = useBrands();

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-1 lg:items-center">
        <div className="relative sm:col-span-2 lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name, brand, model…"
            className="pl-9"
            aria-label="Search products"
          />
        </div>

        <Select value={filters.category} onValueChange={onCategoryChange}>
          <SelectTrigger className="lg:w-44" aria-label="Filter by category">
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

        <Select value={filters.brand} onValueChange={onBrandChange}>
          <SelectTrigger className="lg:w-40" aria-label="Filter by brand">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Brands</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(v) => onStatusChange(v as ProductFilters['status'])}>
          <SelectTrigger className="lg:w-36" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onAdd}>
        <Plus className="h-4 w-4" />
        Add Product
      </Button>
    </div>
  );
}
