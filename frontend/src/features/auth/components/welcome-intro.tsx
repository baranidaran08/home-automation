'use client';

import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeIntroProps {
  onSignIn: () => void;
}

const HIGHLIGHTS = ['Quotations', 'Products', 'Templates', 'Projects', 'Secure Access'] as const;

/**
 * Welcome-screen right slot: an eyebrow badge, the welcome copy, the Sign In
 * call-to-action, and a row of capability chips — over soft corner glows for
 * depth. Fills its slot so it can slide as one unit.
 */
export function WelcomeIntro({ onSignIn }: WelcomeIntroProps) {
  return (
    <div className="relative flex h-full w-full flex-col justify-center gap-5 overflow-hidden px-8 py-12 sm:px-12 lg:px-16">
      {/* Soft brand washes so the panel reads with depth, not flat. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 top-8 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 right-16 h-56 w-56 rounded-full bg-primary/[0.06] blur-3xl" />
      </div>

      <span className="relative inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background/50 px-3 py-1 text-xs font-medium text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        Enterprise Platform
      </span>

      <div className="relative space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
          Welcome to Xen Automation
        </h1>
        <p className="text-base font-medium text-primary">
          Smart Home Automation Management Platform
        </p>
      </div>

      <p className="relative max-w-md text-sm leading-relaxed text-muted-foreground">
        Manage quotations, products, templates, inventory, and customer projects from one
        centralized dashboard.
      </p>

      <div className="relative">
        <Button size="lg" onClick={onSignIn}>
          Sign In
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative flex flex-wrap gap-2 pt-1">
        {HIGHLIGHTS.map((label) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/40 px-3 py-1.5 text-xs font-medium text-muted-foreground"
          >
            <Check className="h-3 w-3 text-primary" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
