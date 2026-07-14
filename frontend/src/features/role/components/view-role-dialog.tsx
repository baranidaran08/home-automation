'use client';

import { useMemo } from 'react';
import { ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Role } from '@/types/rbac';

interface ViewRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
}

/** Read-only role details: description + its permissions grouped by module. */
export function ViewRoleDialog({ open, onOpenChange, role }: ViewRoleDialogProps) {
  const groups = useMemo(() => {
    const byModule = new Map<string, string[]>();
    for (const p of role?.permissions ?? []) {
      const list = byModule.get(p.module) ?? [];
      list.push(p.action);
      byModule.set(p.module, list);
    }
    return [...byModule.entries()];
  }, [role]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {role?.name}
            {role?.isSystem && <Badge variant="outline">System</Badge>}
          </DialogTitle>
          <DialogDescription>{role?.description || 'No description.'}</DialogDescription>
        </DialogHeader>

        {role?.isSuperAdmin ? (
          <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
            Full access to all modules.
          </div>
        ) : groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">This role has no permissions yet.</p>
        ) : (
          <div className="space-y-3">
            {groups.map(([module, actions]) => (
              <div key={module} className="space-y-1">
                <p className="text-sm font-medium capitalize">{module}</p>
                <div className="flex flex-wrap gap-1.5">
                  {actions.map((action) => (
                    <Badge key={action} variant="secondary" className="capitalize">
                      {action}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
