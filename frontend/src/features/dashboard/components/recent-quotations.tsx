'use client';

import Link from 'next/link';
import { Download, FileText, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePermissions } from '@/hooks/use-permissions';
import { MODULES, ACTIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/utils/format';
import { quotationService } from '@/services/quotation.service';
import { useRecentQuotations } from '../hooks/use-recent-quotations';
import type { QuotationStatus } from '@/types/quotation';

const SKELETON_ROWS = 4;

/**
 * Quotation status pill. Kept local rather than in the shared StatusBadge:
 * that one models active/inactive, which is a different vocabulary from the
 * draft/generated/failed lifecycle.
 *
 * Dark mode needs a stronger alpha — a 10% fill over a dark card is only a few
 * RGB points and reads as transparent.
 */
const STATUS_STYLES: Record<QuotationStatus, string> = {
  generated: 'border-success/20 bg-success/10 text-success dark:border-success/40 dark:bg-success/25',
  draft: 'border-border bg-muted text-muted-foreground',
  failed:
    'border-destructive/20 bg-destructive/10 text-destructive dark:border-destructive/40 dark:bg-destructive/25',
};

function QuotationStatusBadge({ status }: { status: QuotationStatus }) {
  return (
    <Badge variant="outline" className={cn('capitalize', STATUS_STYLES[status])}>
      {status}
    </Badge>
  );
}

/**
 * The five most recent quotations — the dashboard's view of real activity.
 *
 * Gated on `quotations:read`: the panel neither renders nor fetches without it.
 * The backend enforces this independently — this is a UX gate, not a security
 * boundary.
 */
export function RecentQuotations() {
  const { can } = usePermissions();
  const canRead = can(MODULES.QUOTATIONS, ACTIONS.READ);
  const canCreate = can(MODULES.QUOTATIONS, ACTIONS.CREATE);

  const { data, isLoading, isError } = useRecentQuotations({ enabled: canRead });

  if (!canRead) return null;

  const quotations = data?.data ?? [];

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Recent Quotations</CardTitle>
        {canCreate && (
          <Button asChild variant="ghost" size="sm" className="-mr-2 gap-1.5 text-xs">
            <Link href={ROUTES.dashboard.quotations}>
              <Plus className="h-3.5 w-3.5" />
              New
            </Link>
          </Button>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <ul className="divide-y">
            {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <li key={i} className="flex items-center justify-between gap-4 py-3.5">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-20" />
              </li>
            ))}
          </ul>
        ) : isError ? (
          <p className="py-10 text-center text-sm text-destructive">
            Couldn&apos;t load recent quotations.
          </p>
        ) : quotations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <FileText className="h-8 w-8 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium">No quotations yet</p>
            {canCreate && (
              <Button asChild variant="outline" size="sm" className="mt-2">
                <Link href={ROUTES.dashboard.quotations}>Generate your first quotation</Link>
              </Button>
            )}
          </div>
        ) : (
          <ul className="divide-y">
            {quotations.map((q) => (
              <li key={q._id} className="flex items-center justify-between gap-4 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{q.customerName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {q.quotationNumber} · {formatDate(q.quotationDate)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="hidden text-sm font-semibold tabular-nums sm:inline">
                    {formatCurrency(q.grandTotal)}
                  </span>
                  <QuotationStatusBadge status={q.status} />
                  {/* Only generated quotations have a PDF to fetch. */}
                  {q.pdf && (
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={`Download quotation ${q.quotationNumber}`}
                    >
                      <a href={quotationService.downloadHref(q._id)}>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
