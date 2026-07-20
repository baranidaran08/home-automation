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
    // Close the confirmation FIRST and yield a tick so Radix runs its close
    // cleanup — which restores the `pointer-events` lock it puts on <body> —
    // BEFORE the logout navigation unmounts the whole tree. Navigating while the
    // dialog is still open leaks that lock, leaving the login page unclickable
    // until a manual refresh. Then reuse the existing logout logic verbatim.
    setConfirmOpen(false);
    await new Promise((resolve) => setTimeout(resolve, 0));
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* `modal={false}`: a modal dropdown locks <body> pointer-events; when the
          Logout item opens the confirm AlertDialog in the same tick, the dialog
          captures that locked value as its "previous" and restores it on Cancel —
          freezing the dashboard until refresh. Non-modal, the dropdown never
          locks the body, so the dialog manages the lock cleanly on its own. */}
      <DropdownMenu modal={false}>
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
            // Let the menu close normally on select (no preventDefault), then
            // open the confirm dialog — so only ONE Radix modal layer is ever
            // open at a time, avoiding a stacked-layer body-lock leak on logout.
            onSelect={() => setConfirmOpen(true)}
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
