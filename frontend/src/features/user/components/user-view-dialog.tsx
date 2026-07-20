'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InfoField } from '@/components/shared/info-field';
import { formatDate, formatDateTime } from '@/utils/format';
import type { User } from '@/types/rbac';

interface UserViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The row's user record — the same shape the details page edits. */
  user?: User | null;
}

/**
 * Read-only "quick view" of a user, opened from the Users table's eye action.
 * Purely presentational: no inputs, no Save/Cancel — only a Close button. It
 * renders the same record the row already holds (the same source the User
 * Details page uses), so both always show identical information. Reuses the
 * shared Avatar, Badge and InfoField primitives and the existing Dialog (which
 * brings the standard open/close animation and responsive sizing).
 */
export function UserViewDialog({ open, onOpenChange, user }: UserViewDialogProps) {
  const invitationPending = Boolean(user?.mustChangePassword);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>User details</DialogTitle>
        </DialogHeader>

        {user && (
          <div className="space-y-6">
            {/* Identity header */}
            <div className="flex items-center gap-4">
              <Avatar
                src={user.avatarUrl}
                name={user.name}
                className="h-16 w-16 text-lg text-primary-foreground"
              />
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-foreground">{user.name}</p>
                <Badge variant={user.role?.isSuperAdmin ? 'default' : 'secondary'} className="mt-1">
                  {user.role?.name ?? '—'}
                </Badge>
              </div>
            </div>

            {/* Read-only fields */}
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoField label="Email Address">{user.email}</InfoField>
              <InfoField label="Phone Number">{user.phone || '—'}</InfoField>
              <InfoField label="Role">{user.role?.name ?? '—'}</InfoField>
              <InfoField label="Account Status">
                {invitationPending ? (
                  <Badge variant="outline" className="border-amber-500/40 text-amber-500">
                    Pending activation
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-500">
                    Active
                  </Badge>
                )}
              </InfoField>
              <InfoField label="Created On">{formatDate(user.createdAt)}</InfoField>
              <InfoField label="Last Login">
                {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never'}
              </InfoField>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
