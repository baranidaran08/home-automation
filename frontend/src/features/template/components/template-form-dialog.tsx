'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
import { TemplateFileUploader } from './template-file-uploader';
import { useCategoryOptions } from '@/features/product';
import { useTemplateMutations } from '../hooks/use-template-mutations';
import {
  templateFormSchema,
  templateFormDefaults,
  type TemplateFormValues,
} from '../schemas/template.schema';
import type { Template } from '@/types/template';

interface TemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: Template | null;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

/** Upload (create) / Replace (edit) template modal — RHF + Zod + .docx upload. */
export function TemplateFormDialog({ open, onOpenChange, template }: TemplateFormDialogProps) {
  const isEditing = Boolean(template);
  const { data: categoryOptions = [], isLoading: loadingCategories } = useCategoryOptions();
  const { create, update } = useTemplateMutations();
  const isSubmitting = create.isPending || update.isPending;

  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: templateFormDefaults,
  });

  useEffect(() => {
    if (!open) return;
    if (template) {
      reset({
        category: template.category?._id ?? '',
        templateName: template.templateName,
        description: template.description ?? '',
      });
    } else {
      reset(templateFormDefaults);
    }
    setFile(null);
    setProgress(null);
  }, [open, template, reset]);

  const onSubmit = async (values: TemplateFormValues) => {
    if (!isEditing && !file) {
      toast.error('Please select a Word (.docx) file');
      return;
    }

    const formData = new FormData();
    formData.append('category', values.category);
    formData.append('templateName', values.templateName);
    formData.append('description', values.description ?? '');
    if (file) formData.append('templateFile', file);

    const onProgress = (e: { loaded: number; total?: number }) => {
      if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
    };

    try {
      if (file) setProgress(0);
      if (isEditing && template) {
        await update.mutateAsync({ id: template._id, formData, onProgress });
      } else {
        await create.mutateAsync({ formData, onProgress });
      }
      onOpenChange(false);
    } catch {
      setProgress(null); // errors toasted in the mutation hooks
    }
  };

  const existingFile = isEditing && template ? template.templateFile : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Template' : 'Upload Template'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update details or replace the Word (.docx) template.'
              : 'Each category can have one Word (.docx) template.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
                    <SelectValue placeholder={loadingCategories ? 'Loading…' : 'Select category'} />
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
            <Label htmlFor="templateName">Template Name</Label>
            <Input
              id="templateName"
              placeholder="e.g. Smart Lighting"
              disabled={isSubmitting}
              {...register('templateName')}
            />
            <FieldError message={errors.templateName?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" disabled={isSubmitting} {...register('description')} />
            <FieldError message={errors.description?.message} />
          </div>

          <div className="space-y-2">
            <Label>
              Word Template (.docx){' '}
              {isEditing && <span className="text-muted-foreground">(optional)</span>}
            </Label>
            <TemplateFileUploader
              file={file}
              onFileChange={setFile}
              existingFile={existingFile}
              progress={progress}
              uploading={isSubmitting}
              disabled={isSubmitting}
            />
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
              {isEditing ? 'Save Changes' : 'Upload Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
