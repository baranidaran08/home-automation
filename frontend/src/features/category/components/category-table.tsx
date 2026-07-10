'use client';

import { Eye, Pencil, Trash2, FolderTree } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, truncate } from '@/utils/format';
import type { Category } from '@/types/category';

interface CategoryTableProps {
  categories: Category[];
  isLoading: boolean;
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const COLUMN_COUNT = 4;
const SKELETON_ROWS = 5;

/** Category list table with loading skeleton and empty state. */
export function CategoryTable({
  categories,
  isLoading,
  onView,
  onEdit,
  onDelete,
}: CategoryTableProps) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category Name</TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead className="hidden sm:table-cell">Created</TableHead>
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
          ) : categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} className="h-40">
                <div className="flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                  <FolderTree className="h-8 w-8" aria-hidden />
                  <p className="text-sm font-medium">No categories available.</p>
                  <p className="text-xs">
                    {"Click 'Add Category' to create your first category."}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow key={category._id}>
                <TableCell className="font-medium">{category.categoryName}</TableCell>
                <TableCell className="hidden max-w-xs text-muted-foreground md:table-cell">
                  {category.description ? truncate(category.description, 60) : '—'}
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {formatDate(category.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(category)}
                      aria-label={`View ${category.categoryName}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(category)}
                      aria-label={`Edit ${category.categoryName}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(category)}
                      aria-label={`Delete ${category.categoryName}`}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
