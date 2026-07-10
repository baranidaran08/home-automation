import { Construction } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ComingSoonProps {
  title: string;
  description?: string;
}

/**
 * Reusable placeholder for modules that are not implemented yet. Quick-action
 * buttons navigate here so the flow works end-to-end before the real pages
 * exist.
 */
export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Construction className="h-6 w-6" aria-hidden />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">
              {description ?? 'This module is coming soon.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
