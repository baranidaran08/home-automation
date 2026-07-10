'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProductImageUploader } from './product-image-uploader';
import { useCategoryOptions } from '../hooks/use-category-options';
import { useProductMutations } from '../hooks/use-product-mutations';
import {
  productFormSchema,
  productFormDefaults,
  type ProductFormValues,
} from '../schemas/product.schema';
import type { Product, ProductImage } from '@/types/product';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

/** Add/Edit product modal — RHF + Zod for fields, local state for images. */
export function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  const isEditing = Boolean(product);
  const { data: categoryOptions = [], isLoading: loadingCategories } = useCategoryOptions();
  const { create, update } = useProductMutations();
  const isSubmitting = create.isPending || update.isPending;

  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [removedPublicIds, setRemovedPublicIds] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: productFormDefaults,
  });

  useEffect(() => {
    if (!open) return;
    if (product) {
      reset({
        productName: product.productName,
        category: product.category?._id ?? '',
        brand: product.brand ?? '',
        modelNumber: product.modelNumber ?? '',
        description: product.description ?? '',
        specifications: product.specifications ?? '',
        warranty: product.warranty ?? '',
        price: product.price,
        stock: product.stock,
        status: product.status,
      });
      setExistingImages(product.images ?? []);
    } else {
      reset(productFormDefaults);
      setExistingImages([]);
    }
    setRemovedPublicIds([]);
    setFiles([]);
  }, [open, product, reset]);

  const removeExisting = (publicId: string) => {
    setExistingImages((imgs) => imgs.filter((img) => img.publicId !== publicId));
    setRemovedPublicIds((ids) => [...ids, publicId]);
  };

  const onSubmit = async (values: ProductFormValues) => {
    const formData = new FormData();
    formData.append('productName', values.productName);
    formData.append('category', values.category);
    formData.append('brand', values.brand ?? '');
    formData.append('modelNumber', values.modelNumber ?? '');
    formData.append('description', values.description ?? '');
    formData.append('specifications', values.specifications ?? '');
    formData.append('warranty', values.warranty ?? '');
    formData.append('price', String(values.price));
    formData.append('stock', String(values.stock));
    formData.append('status', values.status);
    files.forEach((file) => formData.append('images', file));
    if (removedPublicIds.length) {
      formData.append('removeImages', JSON.stringify(removedPublicIds));
    }

    try {
      if (isEditing && product) {
        await update.mutateAsync({ id: product._id, formData });
      } else {
        await create.mutateAsync(formData);
      }
      onOpenChange(false);
    } catch {
      // errors toasted in the mutation hooks
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Product' : 'Add Product'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update this inventory item.' : 'Add a new product to the inventory.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input id="productName" disabled={isSubmitting} {...register('productName')} />
              <FieldError message={errors.productName?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting || loadingCategories}
                  >
                    <SelectTrigger id="category">
                      <SelectValue
                        placeholder={loadingCategories ? 'Loading…' : 'Select category'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.category?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" disabled={isSubmitting} {...register('brand')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelNumber">Model Number</Label>
              <Input id="modelNumber" disabled={isSubmitting} {...register('modelNumber')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step="0.01"
                disabled={isSubmitting}
                {...register('price')}
              />
              <FieldError message={errors.price?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min={0}
                step="1"
                disabled={isSubmitting}
                {...register('stock')}
              />
              <FieldError message={errors.stock?.message} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="warranty">Warranty</Label>
              <Input
                id="warranty"
                placeholder="e.g. 2 years"
                disabled={isSubmitting}
                {...register('warranty')}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" disabled={isSubmitting} {...register('description')} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="specifications">Specifications</Label>
              <Textarea
                id="specifications"
                placeholder="Key specs, one per line"
                disabled={isSubmitting}
                {...register('specifications')}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Images</Label>
              <ProductImageUploader
                existingImages={existingImages}
                onRemoveExisting={removeExisting}
                files={files}
                onFilesChange={setFiles}
                disabled={isSubmitting}
              />
            </div>
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
              {isEditing ? 'Save Changes' : 'Create Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
