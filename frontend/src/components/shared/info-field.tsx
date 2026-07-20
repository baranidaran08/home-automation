import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InfoFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

/**
 * A labelled, read-only value block. Shared by the profile and user-details
 * "Account Information" sections so every read-only field looks identical.
 */
export function InfoField({ label, children, className }: InfoFieldProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm font-medium text-foreground">{children}</div>
    </div>
  );
}
