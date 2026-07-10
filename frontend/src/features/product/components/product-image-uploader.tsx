'use client';

import { useEffect, useMemo, useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { IMAGE_RULES } from '../schemas/product.schema';
import type { ProductImage } from '@/types/product';

interface ProductImageUploaderProps {
  /** Already-uploaded Cloudinary images (edit mode). */
  existingImages: ProductImage[];
  onRemoveExisting: (publicId: string) => void;
  /** Newly selected files pending upload. */
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
}

function Thumb({
  src,
  onRemove,
  disabled,
  badge,
}: {
  src: string;
  onRemove: () => void;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-md border bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Product" className="h-full w-full object-cover" />
      {badge && (
        <span className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[10px] text-white">
          {badge}
        </span>
      )}
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        aria-label="Remove image"
        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100 disabled:opacity-50"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

/**
 * Multi-image picker with previews. Shows existing Cloudinary images and local
 * previews for newly selected files; enforces count/type/size limits.
 */
export function ProductImageUploader({
  existingImages,
  onRemoveExisting,
  files,
  onFilesChange,
  disabled,
}: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Object URLs for local previews — revoked when files change/unmount.
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  const total = existingImages.length + files.length;

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = ''; // allow re-selecting the same file

    const valid: File[] = [];
    for (const file of selected) {
      if (!IMAGE_RULES.accept.includes(file.type)) {
        toast.error(`${file.name}: unsupported type`);
        continue;
      }
      if (file.size > IMAGE_RULES.maxSizeMb * 1024 * 1024) {
        toast.error(`${file.name}: exceeds ${IMAGE_RULES.maxSizeMb}MB`);
        continue;
      }
      valid.push(file);
    }

    const room = IMAGE_RULES.maxCount - total;
    if (valid.length > room) {
      toast.error(`You can upload at most ${IMAGE_RULES.maxCount} images`);
    }
    onFilesChange([...files, ...valid.slice(0, Math.max(room, 0))]);
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {existingImages.map((img) => (
          <Thumb
            key={img.publicId}
            src={img.secureUrl}
            onRemove={() => onRemoveExisting(img.publicId)}
            disabled={disabled}
          />
        ))}
        {previews.map((src, i) => (
          <Thumb
            key={src}
            src={src}
            badge="new"
            onRemove={() => onFilesChange(files.filter((_, idx) => idx !== i))}
            disabled={disabled}
          />
        ))}

        {total < IMAGE_RULES.maxCount && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className={cn(
              'flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-xs">Add</span>
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {total}/{IMAGE_RULES.maxCount} images · JPG, PNG, WEBP, AVIF · up to {IMAGE_RULES.maxSizeMb}MB
        each
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_RULES.accept.join(',')}
        multiple
        hidden
        onChange={handleSelect}
      />
    </div>
  );
}
