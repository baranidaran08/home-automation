import Link from 'next/link';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedNumber } from '@/components/shared/animated-number';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  isLoading?: boolean;
  /** Destination for the whole card. Omit to render a plain, non-interactive card. */
  href?: string;
}

/**
 * Presentational statistics card: title, icon tile and an animated value. Shows
 * a skeleton while loading. No data-fetching here — the value is passed in.
 *
 * When `href` is given the whole card becomes one link to its module: a number
 * on a dashboard is really a question ("11 products?"), and the answer should be
 * one click away. Callers omit `href` when the user lacks read permission on
 * that module, so a card never offers a route that would bounce them back.
 */
export function StatCard({ title, value, icon: Icon, isLoading = false, href }: StatCardProps) {
  const body = (
    <CardContent className="flex items-center justify-between gap-4 p-5">
      <div className="min-w-0 space-y-1">
        <p className="truncate text-sm font-medium text-muted-foreground">{title}</p>
        {isLoading ? (
          <Skeleton className="h-9 w-20" />
        ) : (
          <p className="text-3xl font-bold tracking-tight tabular-nums">
            <AnimatedNumber value={value} />
          </p>
        )}
      </div>

      <div
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
          'bg-primary/10 text-primary transition-colors duration-200',
          href && 'group-hover:bg-primary group-hover:text-primary-foreground'
        )}
      >
        <Icon className="h-6 w-6" aria-hidden />
      </div>
    </CardContent>
  );

  if (!href) return <Card>{body}</Card>;

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
      )}
    >
      {/* The link covers the card so the entire surface is the hit target, while
          the content below stays a normal layout rather than being nested inside
          an anchor. */}
      <Link href={href} className="absolute inset-0 z-10">
        <span className="sr-only">{`View ${title}`}</span>
      </Link>

      <ArrowUpRight
        className="absolute right-4 top-4 h-4 w-4 text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        aria-hidden
      />
      {body}
    </Card>
  );
}
