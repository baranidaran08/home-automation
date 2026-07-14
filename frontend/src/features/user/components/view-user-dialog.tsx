'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/format';
import type { User } from '@/types/rbac';

interface ViewUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

/** Read-only user details. */
export function ViewUserDialog({ open, onOpenChange, user }: ViewUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user?.name}</DialogTitle>
          <DialogDescription>{user?.email}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Role">
            <Badge variant={user?.role?.isSuperAdmin ? 'default' : 'secondary'}>
              {user?.role?.name ?? '—'}
            </Badge>
          </Field>
          <Field label="Created">{user ? formatDate(user.createdAt) : '—'}</Field>
        </div>
      </DialogContent>
    </Dialog>
  );
}
