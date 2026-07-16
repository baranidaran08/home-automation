import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          // Mirrors the Input styling exactly (fill, radius, hover/focus, invalid)
          // so single-line and multi-line fields look like one family. `min-h` +
          // padding stand in for Input's fixed `h-11`.
          'flex min-h-[96px] w-full rounded-xl border border-input bg-secondary/50 px-3.5 py-2.5 text-sm transition-all placeholder:text-muted-foreground/70 hover:border-primary/30 focus-visible:border-primary focus-visible:bg-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/10',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
