'use client';

import { CheckCircle2, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { quotationService } from '@/services/quotation.service';
import { formatCurrency } from '@/utils/format';
import type { Quotation } from '@/types/quotation';

interface GeneratedResultProps {
  quotation: Quotation;
  onReset: () => void;
}

/** Success screen after generation — download the PDF or start a new quotation. */
export function GeneratedResult({ quotation, onReset }: GeneratedResultProps) {
  return (
    <Card className="mx-auto max-w-lg">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-8 w-8" aria-hidden />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Quotation Generated</h2>
          <p className="text-sm text-muted-foreground">
            {quotation.quotationNumber} · {formatCurrency(quotation.grandTotal)}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <a href={quotationService.downloadHref(quotation._id)}>
              <Download className="h-4 w-4" />
              Download PDF
            </a>
          </Button>
          <Button variant="outline" onClick={onReset}>
            <Plus className="h-4 w-4" />
            New Quotation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
