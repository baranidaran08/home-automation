'use client';

import { Download, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { templateService } from '@/services/template.service';
import { formatDate } from '@/utils/format';
import type { Template } from '@/types/template';

interface ViewTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template | null;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="col-span-2 break-words">{children}</dd>
    </div>
  );
}

/** Template details: metadata + detected placeholders + download. */
export function ViewTemplateDialog({ open, onOpenChange, template }: ViewTemplateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Template Details</DialogTitle>
        </DialogHeader>

        {template && (
          <div className="space-y-4">
            <dl className="divide-y">
              <Row label="Template Name">{template.templateName}</Row>
              <Row label="Category">{template.category?.categoryName ?? '—'}</Row>
              <Row label="Original File Name">
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-muted-foreground" aria-hidden />
                  {template.templateFile?.originalFileName || '—'}
                </span>
              </Row>
              <Row label="Upload Date">
                {formatDate(template.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
              </Row>
              {template.description && <Row label="Description">{template.description}</Row>}
            </dl>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                Detected Placeholders{' '}
                <span className="text-muted-foreground">({template.placeholders?.length ?? 0})</span>
              </p>
              {template.placeholders?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {template.placeholders.map((name) => (
                    <Badge key={name} variant="secondary" className="font-mono text-[11px]">
                      {`{{${name}}}`}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No placeholders detected.</p>
              )}
            </div>

            <DialogFooter>
              <Button asChild>
                <a href={templateService.downloadHref(template._id)}>
                  <Download className="h-4 w-4" />
                  Download
                </a>
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
