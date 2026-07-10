import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedNumber } from '@/components/shared/animated-number';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  isLoading?: boolean;
  /** Tailwind classes for the icon tile accent, e.g. 'bg-blue-500/10 text-blue-600'. */
  accentClassName?: string;
}

/**
 * Presentational statistics card: title, icon tile and an animated value. Shows
 * a skeleton while loading. No data-fetching here — value is passed in.
 */
export function StatCard({
  title,
  value,
  icon: Icon,
  isLoading = false,
  accentClassName = 'bg-primary/10 text-primary',
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm font-medium text-muted-foreground">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <p className="text-3xl font-bold tracking-tight">
              <AnimatedNumber value={value} />
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
            accentClassName
          )}
        >
          <Icon className="h-6 w-6" aria-hidden />
        </div>
      </CardContent>
    </Card>
  );
}
