import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/** Generic Active/Inactive status pill, reusable across modules. */
export function StatusBadge({ status }: { status: 'active' | 'inactive' }) {
  const isActive = status === 'active';
  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 capitalize',
        // The fill is translucent, so it needs a stronger alpha on the dark
        // canvas: 10% green over a dark card is only ~3 RGB points and reads as
        // transparent. Light mode is unchanged.
        isActive
          ? 'border-success/20 bg-success/10 text-success dark:border-success/40 dark:bg-success/25'
          : 'border-border bg-muted text-muted-foreground'
      )}
    >
      <span
        className={cn('h-1.5 w-1.5 rounded-full', isActive ? 'bg-success' : 'bg-muted-foreground')}
      />
      {status}
    </Badge>
  );
}
