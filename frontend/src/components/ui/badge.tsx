import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none',
  {
    variants: {
      variant: {
        // Soft tinted pills — the enterprise status-badge look (tint bg + strong
        // text). The fills are translucent, so each needs a stronger alpha in
        // dark mode: a 10% tint over the dark card is only a few RGB points and
        // disappears. Light mode keeps the original 10%.
        default: 'border-transparent bg-primary/10 text-primary dark:bg-primary/20',
        secondary: 'border-transparent bg-secondary text-muted-foreground',
        destructive: 'border-transparent bg-destructive/10 text-destructive dark:bg-destructive/20',
        success: 'border-transparent bg-success/10 text-success dark:bg-success/20',
        warning: 'border-transparent bg-warning/10 text-warning dark:bg-warning/20',
        solid: 'border-transparent bg-primary text-primary-foreground',
        outline: 'border-border text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
