import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InfoField } from './info-field';
import { formatDate, formatDateTime } from '@/utils/format';

interface AccountInfoCardProps {
  roleName?: string | null;
  isSuperAdmin?: boolean;
  createdAt?: string | null;
  lastLoginAt?: string | null;
  /**
   * Invitation state, derived from `mustChangePassword`. Omit to hide the field
   * (the My Profile page doesn't show it; the admin User Details page does).
   */
  invitationPending?: boolean;
}

/**
 * Read-only "Account Information" card. Shared by My Profile and User Details so
 * both render role, created date and last login identically; User Details also
 * passes `invitationPending` to surface the invitation status.
 */
export function AccountInfoCard({
  roleName,
  isSuperAdmin,
  createdAt,
  lastLoginAt,
  invitationPending,
}: AccountInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <InfoField label="Role">
          <Badge variant={isSuperAdmin ? 'default' : 'secondary'}>{roleName ?? '—'}</Badge>
        </InfoField>

        {invitationPending !== undefined && (
          <InfoField label="Invitation Status">
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
        )}

        <InfoField label="Created On">{createdAt ? formatDate(createdAt) : '—'}</InfoField>

        <InfoField label="Last Login">
          {lastLoginAt ? formatDateTime(lastLoginAt) : 'Never'}
        </InfoField>
      </CardContent>
    </Card>
  );
}
