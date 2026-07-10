'use client';

import { Eye, Download, Pencil, Trash2, FileText } from 'lucide-react';
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
import { templateService } from '@/services/template.service';
import { formatDate } from '@/utils/format';
import type { Template } from '@/types/template';

interface TemplateTableProps {
  templates: Template[];
  isLoading: boolean;
  onView: (template: Template) => void;
  onEdit: (template: Template) => void;
  onDelete: (template: Template) => void;
}

const COLUMN_COUNT = 5;
const SKELETON_ROWS = 5;

/** Template list table with loading skeleton and empty state. */
export function TemplateTable({
  templates,
  isLoading,
  onView,
  onEdit,
  onDelete,
}: TemplateTableProps) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Template Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="hidden md:table-cell">Original File Name</TableHead>
            <TableHead className="hidden sm:table-cell">Uploaded</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: COLUMN_COUNT }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-6 w-full max-w-[140px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : templates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} className="h-40">
                <div className="flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                  <FileText className="h-8 w-8" aria-hidden />
                  <p className="text-sm font-medium">No templates available.</p>
                  <p className="text-xs">{"Click 'Upload Template' to add your first Word template."}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            templates.map((template) => (
              <TableRow key={template._id}>
                <TableCell>
                  <div className="flex items-center gap-2 font-medium">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="min-w-0 truncate">{template.templateName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {template.category?.categoryName ?? '—'}
                </TableCell>
                <TableCell className="hidden max-w-[220px] truncate text-muted-foreground md:table-cell">
                  {template.templateFile?.originalFileName || '—'}
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {formatDate(template.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(template)}
                      aria-label={`View ${template.templateName}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      aria-label={`Download ${template.templateName}`}
                    >
                      <a href={templateService.downloadHref(template._id)}>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(template)}
                      aria-label={`Edit ${template.templateName}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(template)}
                      aria-label={`Delete ${template.templateName}`}
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
