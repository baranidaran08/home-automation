'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/utils/format';
import type { Category } from '@/types/category';

interface ViewCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="col-span-2 break-words">{children}</dd>
    </div>
  );
}

/** Read-only details view for a category. */
export function ViewCategoryDialog({ open, onOpenChange, category }: ViewCategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Category Details</DialogTitle>
        </DialogHeader>
        {category && (
          <dl className="divide-y">
            <Row label="Name">{category.categoryName}</Row>
            <Row label="Description">{category.description || '—'}</Row>
            <Row label="Slug">
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{category.slug}</code>
            </Row>
            <Row label="Created">{formatDate(category.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</Row>
            <Row label="Updated">{formatDate(category.updatedAt, { dateStyle: 'medium', timeStyle: 'short' })}</Row>
          </dl>
        )}
      </DialogContent>
    </Dialog>
  );
}
