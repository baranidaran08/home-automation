'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  categoryFormSchema,
  categoryFormDefaults,
  type CategoryFormValues,
} from '../schemas/category.schema';
import { useCategoryMutations } from '../hooks/use-category-mutations';
import type { Category } from '@/types/category';

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Passing a category switches the form into edit mode. */
  category?: Category | null;
}

/**
 * Add/Edit category modal. The same form serves both flows — an existing
 * category populates the fields (edit); otherwise it creates.
 */
export function CategoryFormDialog({ open, onOpenChange, category }: CategoryFormDialogProps) {
  const isEditing = Boolean(category);
  const { create, update } = useCategoryMutations();
  const isSubmitting = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: categoryFormDefaults,
  });

  // Sync form values whenever the dialog opens or the target category changes.
  useEffect(() => {
    if (!open) return;
    if (category) {
      reset({
        categoryName: category.categoryName,
        description: category.description ?? '',
      });
    } else {
      reset(categoryFormDefaults);
    }
  }, [open, category, reset]);

  const onSubmit = async (values: CategoryFormValues) => {
    const input = {
      categoryName: values.categoryName,
      description: values.description ?? '',
    };
    try {
      if (isEditing && category) {
        await update.mutateAsync({ id: category._id, input });
      } else {
        await create.mutateAsync(input);
      }
      onOpenChange(false);
    } catch {
      // Errors are surfaced via toast in the mutation hooks; keep dialog open.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Category' : 'Add Category'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details of this home automation field.'
              : 'Create a new home automation field (e.g. Lighting, Security).'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="categoryName">Category Name</Label>
            <Input
              id="categoryName"
              placeholder="e.g. Lighting"
              aria-invalid={!!errors.categoryName}
              disabled={isSubmitting}
              {...register('categoryName')}
            />
            {errors.categoryName && (
              <p className="text-sm text-destructive">{errors.categoryName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Short description (optional)"
              aria-invalid={!!errors.description}
              disabled={isSubmitting}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
