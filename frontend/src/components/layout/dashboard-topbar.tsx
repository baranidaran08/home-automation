'use client';

import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth';

/** Derive up-to-two-letter initials from a name for the avatar badge. */
function initials(name?: string) {
  if (!name) return 'A';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');
}

interface DashboardTopbarProps {
  onMenuClick: () => void;
}

/**
 * Sticky top bar: mobile menu trigger on the left; the logged-in identity
 * (avatar + name/role) and logout on the right. Sits on the light canvas with a
 * translucent blur so content scrolls cleanly underneath.
 */
export function DashboardTopbar({ onMenuClick }: DashboardTopbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 bg-background/80 px-4 backdrop-blur-md sm:px-6 lg:h-20">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* The pill chrome only applies once the name/role is visible (`sm` up).
            On phones the text is hidden, and keeping the pill's asymmetric
            padding would leave dead space beside the avatar and render a
            lopsided oblong — there, the bare avatar is the whole control. */}
        <div className="flex items-center gap-3 rounded-full sm:border sm:border-border/70 sm:bg-card sm:p-1 sm:pl-3 sm:shadow-soft">
          <div className="hidden text-right leading-tight sm:block">
            <span className="block text-sm font-semibold text-foreground">{user?.name}</span>
            {user?.role?.name && (
              <span className="block text-xs text-muted-foreground">{user.role.name}</span>
            )}
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {initials(user?.name)}
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={() => logout()} aria-label="Logout">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
