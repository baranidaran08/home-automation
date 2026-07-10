'use client';

import { useRef } from 'react';
import { FileText, UploadCloud, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { formatBytes } from '@/utils/format';
import { DOCX_RULES } from '../schemas/template.schema';

interface TemplateFileUploaderProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  /** Existing template file shown in replace (edit) mode when no new file is chosen. */
  existingFile?: { originalFileName: string } | null;
  progress?: number | null;
  uploading?: boolean;
  disabled?: boolean;
}

const isDocx = (file: File) =>
  file.name.toLowerCase().endsWith(DOCX_RULES.extension) &&
  DOCX_RULES.mimeTypes.includes(file.type);

/** Single Word (.docx) picker showing file name, size and upload progress. */
export function TemplateFileUploader({
  file,
  onFileChange,
  existingFile,
  progress = null,
  uploading = false,
  disabled,
}: TemplateFileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    event.target.value = '';
    if (!selected) return;
    if (!isDocx(selected)) {
      toast.error('Only Microsoft Word (.docx) files are allowed');
      return;
    }
    if (selected.size > DOCX_RULES.maxSizeMb * 1024 * 1024) {
      toast.error(`File exceeds ${DOCX_RULES.maxSizeMb}MB`);
      return;
    }
    onFileChange(selected);
  };

  const pickFile = () => inputRef.current?.click();

  return (
    <div className="space-y-2">
      {file ? (
        <div className="rounded-md border p-3">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
            </div>
            {!uploading && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onFileChange(null)}
                disabled={disabled}
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {uploading && progress !== null && (
            <div className="mt-3 space-y-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-right text-xs text-muted-foreground">{progress}%</p>
            </div>
          )}
        </div>
      ) : existingFile ? (
        <div className="flex items-center gap-3 rounded-md border p-3">
          <FileText className="h-8 w-8 shrink-0 text-muted-foreground" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {existingFile.originalFileName || 'Current template'}
            </p>
            <p className="text-xs text-muted-foreground">current file</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={pickFile} disabled={disabled}>
            Replace file
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={pickFile}
          disabled={disabled}
          className="flex w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed py-8 text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <UploadCloud className="h-6 w-6" />
          <span className="text-sm font-medium">Select Word Template (.docx)</span>
          <span className="text-xs">.docx only · up to {DOCX_RULES.maxSizeMb}MB</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        hidden
        onChange={handleSelect}
      />
    </div>
  );
}
