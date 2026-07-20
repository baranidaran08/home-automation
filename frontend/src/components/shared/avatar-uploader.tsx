'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ImageCropDialog } from './image-crop-dialog';

/** Client-side guardrails mirroring the backend image filter. */
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

interface AvatarUploaderProps {
  /** Currently stored avatar URL (before any pending change). */
  src?: string | null;
  /** Name for initials fallback + alt text. */
  name?: string | null;
  /** Pending selected file (lifted to the parent so it can submit it). */
  file: File | null;
  /** Pending "remove picture" flag (lifted to the parent). */
  removed: boolean;
  onFileSelect: (file: File | null) => void;
  onRemove: () => void;
  disabled?: boolean;
  /** Avatar diameter classes (default is the large profile size). */
  className?: string;
}

/**
 * Profile-picture control: the avatar itself with a small camera badge on its
 * bottom-right edge. The badge opens a menu (Upload Photo, plus Remove Photo when
 * a picture exists) — no separate buttons or helper text. Picking a file opens
 * the crop dialog so the subject is framed before upload. The pending
 * `file`/`removed` state lives in the parent so a single "Save Changes" sends it.
 */
export function AvatarUploader({
  src,
  name,
  file,
  removed,
  onFileSelect,
  onRemove,
  disabled,
  className,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // The raw picked file awaiting crop (separate from the cropped `file`).
  const [cropSource, setCropSource] = useState<File | null>(null);

  // Build (and revoke) an object URL for the pending file so we can preview it
  // without uploading first.
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Resolved image: pending file preview wins; a pending removal clears it;
  // otherwise the stored picture.
  const shownSrc = previewUrl ?? (removed ? null : src);
  const hasPicture = Boolean(shownSrc);

  const pick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    // Reset the input so re-selecting the same file still fires onChange.
    e.target.value = '';
    if (!selected) return;
    if (!ACCEPTED.includes(selected.type)) {
      toast.error('Please choose a JPG, PNG, WEBP or AVIF image.');
      return;
    }
    if (selected.size > MAX_BYTES) {
      toast.error('Image must be 5 MB or smaller.');
      return;
    }
    // Open the cropper first so the user frames the photo.
    setCropSource(selected);
  };

  const handleCropped = (cropped: File) => {
    setCropSource(null);
    onFileSelect(cropped);
  };

  return (
    <div className="relative inline-block">
      <Avatar
        src={shownSrc}
        name={name}
        className={cn('h-20 w-20 text-xl text-primary-foreground', className)}
      />

      {/* Camera badge overlapping the bottom-right edge; opens the photo menu. */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label="Change profile photo"
            className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-soft outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[11rem]">
          <DropdownMenuItem onSelect={pick}>
            <Upload aria-hidden />
            {hasPicture ? 'Upload new photo' : 'Upload photo'}
          </DropdownMenuItem>
          {hasPicture && (
            <DropdownMenuItem
              destructive
              onSelect={() => {
                onFileSelect(null);
                onRemove();
              }}
            >
              <Trash2 aria-hidden />
              Remove photo
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />

      <ImageCropDialog
        open={cropSource !== null}
        file={cropSource}
        onCancel={() => setCropSource(null)}
        onCropped={handleCropped}
      />
    </div>
  );
}
