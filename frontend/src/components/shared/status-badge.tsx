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
        isActive
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          : 'border-muted-foreground/30 bg-muted text-muted-foreground'
      )}
    >
      <span
        className={cn('h-1.5 w-1.5 rounded-full', isActive ? 'bg-emerald-500' : 'bg-muted-foreground')}
      />
      {status}
    </Badge>
  );
}
