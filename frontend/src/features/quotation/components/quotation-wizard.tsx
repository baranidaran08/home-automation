'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, FileCog, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useQuotationWizard, WIZARD_STEPS } from '../hooks/use-quotation-wizard';
import { useQuotationGenerate } from '../hooks/use-quotation-generate';
import { StepCustomer } from './steps/step-customer';
import { StepCategories } from './steps/step-categories';
import { StepProducts } from './steps/step-products';
import { StepPreview } from './steps/step-preview';
import { QuotationSummary } from './quotation-summary';
import { GeneratedResult } from './generated-result';
import type { Quotation } from '@/types/quotation';

/** Stepper header showing progress through the wizard. */
function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-2">
      {WIZARD_STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold',
                active && 'border-primary bg-primary text-primary-foreground',
                done && 'border-primary bg-primary/10 text-primary',
                !active && !done && 'border-muted-foreground/30 text-muted-foreground'
              )}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={cn('text-sm', active ? 'font-medium' : 'text-muted-foreground')}>
              {label}
            </span>
            {i < WIZARD_STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}

/** The complete Generate Quotation wizard. */
export function QuotationWizard() {
  const wizard = useQuotationWizard();
  const generate = useQuotationGenerate();
  const [result, setResult] = useState<Quotation | null>(null);

  const { step, canNext, next, back, reset } = wizard;
  const isLast = step === WIZARD_STEPS.length - 1;
  const withSummary = step >= 2; // Products & Preview show the live summary

  const handleReset = () => {
    reset();
    setResult(null);
  };

  const handleGenerate = async () => {
    try {
      const quotation = await generate.mutateAsync({
        customerName: wizard.customer.customerName,
        phone: wizard.customer.phone,
        email: wizard.customer.email,
        address: wizard.customer.address,
        projectName: wizard.customer.projectName,
        projectLocation: wizard.customer.projectLocation,
        items: wizard.itemsForApi,
        serviceCharges: wizard.serviceChargesForApi,
      });
      setResult(quotation);
      wizard.reset(); // draft persisted only until the quotation is generated
    } catch {
      // Error is surfaced via toast in the mutation's onError handler.
    }
  };

  if (result) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Header />
        <GeneratedResult quotation={result} onReset={handleReset} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Header />
      <Stepper current={step} />

      <div className={cn('grid gap-6', withSummary && 'lg:grid-cols-[1fr_320px]')}>
        <div>
          {step === 0 && <StepCustomer wizard={wizard} />}
          {step === 1 && <StepCategories wizard={wizard} />}
          {step === 2 && <StepProducts wizard={wizard} />}
          {step === 3 && <StepPreview wizard={wizard} />}
        </div>

        {withSummary && (
          <div>
            <QuotationSummary
              categoryTotals={wizard.categoryTotals}
              grandTotal={wizard.grandTotal}
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <Button variant="outline" onClick={back} disabled={step === 0 || generate.isPending}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {isLast ? (
          <Button onClick={handleGenerate} disabled={generate.isPending || wizard.itemsForApi.length === 0}>
            {generate.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileCog className="h-4 w-4" />
            )}
            {generate.isPending ? 'Generating…' : 'Generate Quotation'}
          </Button>
        ) : (
          <Button onClick={next} disabled={!canNext}>
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Generate Quotation</h1>
      <p className="text-sm text-muted-foreground">
        Fill customer details, pick categories &amp; products, then generate the merged PDF.
      </p>
    </div>
  );
}
