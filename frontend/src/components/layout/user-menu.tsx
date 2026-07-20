'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut, User as UserIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/avatar';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useAuth } from '@/features/auth';
import { ROUTES } from '@/constants/routes';

/**
 * Topbar identity control. The avatar + name + role is a single clickable
 * trigger that opens an accessible dropdown (Radix: keyboard nav, click-outside,
 * escape-to-close, focus return). "My Profile" navigates to the profile page;
 * "Logout" opens a confirmation dialog rather than signing out immediately, and
 * only the existing `logout()` action runs on confirm — the flow itself is
 * unchanged.
 */
export function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // Reuse the existing logout logic verbatim (clears session + redirects).
      await logout();
    } finally {
      setLoggingOut(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex items-center gap-3 rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:border sm:border-border/70 sm:bg-card sm:p-1 sm:pl-3 sm:shadow-soft sm:hover:bg-accent/40"
          aria-label="Open account menu"
        >
          <div className="hidden text-right leading-tight sm:block">
            <span className="block text-sm font-semibold text-foreground">{user?.name}</span>
            {user?.role?.name && (
              <span className="block text-xs text-muted-foreground">{user.role.name}</span>
            )}
          </div>
          <Avatar
            src={user?.avatarUrl}
            name={user?.name}
            className="h-9 w-9 text-xs text-primary-foreground"
          />
          <ChevronDown
            className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block"
            aria-hidden
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-[15rem]">
          {/* Identity header — name + role, echoing the spec's dropdown layout. */}
          <div className="flex items-center gap-3 px-2.5 py-2">
            <Avatar
              src={user?.avatarUrl}
              name={user?.name}
              className="h-10 w-10 text-sm text-primary-foreground"
            />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold text-foreground">{user?.name}</p>
              {user?.role?.name && (
                <p className="truncate text-xs text-muted-foreground">{user.role.name}</p>
              )}
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={() => router.push(ROUTES.dashboard.profile)}>
            <UserIcon aria-hidden />
            My Profile
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            destructive
            // Defer opening the dialog until after the menu has closed so focus
            // returns cleanly, then the AlertDialog takes over.
            onSelect={(e) => {
              e.preventDefault();
              setConfirmOpen(true);
            }}
          >
            <LogOut aria-hidden />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Logout"
        description="Are you sure you want to log out? You will need to sign in again to continue."
        confirmLabel="Logout"
        cancelLabel="Cancel"
        destructive
        loading={loggingOut}
        onConfirm={handleLogout}
      />
    </>
  );
}
