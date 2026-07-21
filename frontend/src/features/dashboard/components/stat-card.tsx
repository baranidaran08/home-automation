import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';
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
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <p className="truncate text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      </div>
      {isLoading ? (
        <Skeleton className="mt-4 h-10 w-24" />
      ) : (
        <p className="mt-4 text-4xl font-semibold tracking-tight tabular-nums text-foreground">
          <AnimatedNumber value={value} />
        </p>
      )}
    </CardContent>
  );

  if (!href) return <Card>{body}</Card>;

  return (
    <Card
      className={cn(
        'group relative transition-colors',
        'hover:bg-accent/30 focus-within:ring-1 focus-within:ring-ring'
      )}
    >
      {/* The link covers the card so the entire surface is the hit target, while
          the content below stays a normal layout rather than being nested inside
          an anchor. */}
      <Link href={href} className="absolute inset-0 z-10">
        <span className="sr-only">{`View ${title}`}</span>
      </Link>
      {body}
    </Card>
  );
}
