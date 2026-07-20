'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, ZoomIn } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

/** Size of the on-screen crop viewport (square) and the exported image. */
const VIEWPORT = 264;
const OUTPUT = 512;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

interface ImageCropDialogProps {
  open: boolean;
  /** The raw picked file to crop. */
  file: File | null;
  onCancel: () => void;
  /** Receives the cropped square image, ready to upload. */
  onCropped: (file: File) => void;
}

/**
 * Circular crop + reposition dialog. The picture can be dragged to reposition and
 * zoomed so the subject (e.g. a face) sits inside the circle — then it is drawn to
 * a square canvas and exported, so the uploaded image is exactly what was framed
 * (no more heads clipped by the avatar's center-crop). Dependency-free: a plain
 * `<img>` transform for the live preview and a canvas for the export.
 */
export function ImageCropDialog({ open, file, onCancel, onCropped }: ImageCropDialogProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(
    null
  );

  // Mouse-wheel / trackpad zoom over the crop area. Registered natively with
  // `{ passive: false }` so we can preventDefault and stop the page scrolling
  // while zooming (React's onWheel is passive and can't).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((z) => clamp(z - e.deltaY * 0.0015, MIN_ZOOM, MAX_ZOOM));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [open]);

  // Build (and revoke) an object URL for the picked file; reset the transform.
  useEffect(() => {
    if (!file) {
      setSrc(null);
      setNatural(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setSrc(url);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Geometry: at zoom 1 the image "covers" the viewport (like object-cover);
  // higher zoom multiplies from there.
  const coverScale = natural ? Math.max(VIEWPORT / natural.w, VIEWPORT / natural.h) : 1;
  const scale = coverScale * zoom;
  const dispW = natural ? natural.w * scale : 0;
  const dispH = natural ? natural.h * scale : 0;
  const maxX = Math.max(0, (dispW - VIEWPORT) / 2);
  const maxY = Math.max(0, (dispH - VIEWPORT) / 2);

  // Re-clamp the offset whenever the bounds change (e.g. after zooming out).
  useEffect(() => {
    setOffset((o) => ({ x: clamp(o.x, -maxX, maxX), y: clamp(o.y, -maxY, maxY) }));
  }, [maxX, maxY]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!natural) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, startY: e.clientY, baseX: offset.x, baseY: offset.y };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const nextX = drag.current.baseX + (e.clientX - drag.current.startX);
    const nextY = drag.current.baseY + (e.clientY - drag.current.startY);
    setOffset({ x: clamp(nextX, -maxX, maxX), y: clamp(nextY, -maxY, maxY) });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleApply = useCallback(async () => {
    const img = imgRef.current;
    if (!img || !natural) return;
    setSaving(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = OUTPUT;
      canvas.height = OUTPUT;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unsupported');

      // Map the viewport square back onto the source image.
      const imgLeft = (VIEWPORT - dispW) / 2 + offset.x;
      const imgTop = (VIEWPORT - dispH) / 2 + offset.y;
      const sx = -imgLeft / scale;
      const sy = -imgTop / scale;
      const sSize = VIEWPORT / scale;

      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, OUTPUT, OUTPUT);

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.9)
      );
      if (!blob) throw new Error('Export failed');

      const baseName = (file?.name ?? 'avatar').replace(/\.[^.]+$/, '');
      onCropped(new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' }));
    } finally {
      setSaving(false);
    }
  }, [natural, dispW, dispH, offset, scale, file, onCropped]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust photo</DialogTitle>
          <DialogDescription>
            Drag to reposition, scroll or use the slider to zoom, so your photo sits inside the
            circle.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-2">
          {/* Crop viewport: image underneath, a circular cut-out mask on top. */}
          <div
            ref={containerRef}
            className="relative cursor-grab touch-none overflow-hidden rounded-lg bg-muted active:cursor-grabbing"
            style={{ width: VIEWPORT, height: VIEWPORT }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            role="application"
            aria-label="Drag to reposition photo, scroll to zoom"
          >
            {src && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imgRef}
                src={src}
                alt="Crop preview"
                draggable={false}
                onLoad={(e) =>
                  setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })
                }
                className="pointer-events-none absolute max-w-none cursor-grab select-none"
                style={{
                  width: dispW || undefined,
                  height: dispH || undefined,
                  left: (VIEWPORT - dispW) / 2,
                  top: (VIEWPORT - dispH) / 2,
                  transform: `translate(${offset.x}px, ${offset.y}px)`,
                }}
              />
            )}
            {/* Ring + dimmed corners mark the circular crop area. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-lg"
              style={{ boxShadow: 'inset 0 0 0 9999px rgba(0,0,0,0.5)', borderRadius: '9999px' }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/70"
            />
          </div>

          {/* Zoom control. */}
          <div className="flex w-full items-center gap-3 px-1">
            <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              disabled={!natural}
              aria-label="Zoom"
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleApply} disabled={!natural || saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
