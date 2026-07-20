'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserMenu } from './user-menu';

interface DashboardTopbarProps {
  onMenuClick: () => void;
}

/**
 * Sticky top bar: mobile menu trigger on the left; the logged-in identity on the
 * right as a clickable account menu (profile + logout live inside it — there is
 * no standalone logout button). Sits on the canvas with a translucent blur so
 * content scrolls cleanly underneath.
 */
export function DashboardTopbar({ onMenuClick }: DashboardTopbarProps) {
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

      <UserMenu />
    </header>
  );
}
