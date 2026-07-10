'use client';

import { CalendarClock, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import type { QuotationWizardState } from '../../hooks/use-quotation-wizard';

/** Step 1 — customer details. Quotation number & date are auto-generated on save. */
export function StepCustomer({ wizard }: { wizard: QuotationWizardState }) {
  const { customer, setCustomerField } = wizard;

  return (
    <div className="space-y-4">
      <Card className="bg-muted/40">
        <CardContent className="flex flex-wrap gap-x-8 gap-y-2 p-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Hash className="h-4 w-4" /> Quotation No. — auto-generated (QTN-000001)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="h-4 w-4" /> Date — set automatically
          </span>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="customerName">Customer Name *</Label>
          <Input
            id="customerName"
            value={customer.customerName}
            onChange={(e) => setCustomerField('customerName', e.target.value)}
            placeholder="e.g. John Doe"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={customer.phone}
            onChange={(e) => setCustomerField('phone', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={customer.email}
            onChange={(e) => setCustomerField('email', e.target.value)}
            aria-invalid={!wizard.emailValid}
          />
          {!wizard.emailValid && (
            <p className="text-sm text-destructive">Enter a valid email address (or leave it blank).</p>
          )}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={customer.address}
            onChange={(e) => setCustomerField('address', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="projectName">Project Name</Label>
          <Input
            id="projectName"
            value={customer.projectName}
            onChange={(e) => setCustomerField('projectName', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="projectLocation">Project Location</Label>
          <Input
            id="projectLocation"
            value={customer.projectLocation}
            onChange={(e) => setCustomerField('projectLocation', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
