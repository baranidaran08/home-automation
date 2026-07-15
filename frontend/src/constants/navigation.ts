import {
  LayoutDashboard,
  FolderTree,
  Package,
  FileText,
  ReceiptText,
  Settings,
  Users,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from './routes';
import { MODULES } from './permissions';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** When false, the item renders disabled with a "Soon" badge. */
  enabled: boolean;
  /** RBAC module this item belongs to; the sidebar hides it without read access. */
  module: string;
}

/**
 * A collapsible section holding related links (e.g. Settings → Users, Roles).
 * A group has no route of its own — it only expands/collapses. Its children are
 * ordinary NavItems, so each is still RBAC-filtered individually and the group
 * disappears entirely when none of its children are accessible.
 */
export interface NavGroup {
  label: string;
  icon: LucideIcon;
  children: NavItem[];
}

export type NavEntry = NavItem | NavGroup;

/** Discriminates a collapsible group from a plain link. */
export const isNavGroup = (entry: NavEntry): entry is NavGroup => 'children' in entry;

/**
 * Sidebar menu. Each item declares the RBAC `module` it maps to; the sidebar
 * filters out anything the current user cannot read, so users only see the
 * modules they can access. Order is intentional: operational modules first,
 * administration nested under Settings last.
 */
export const SIDEBAR_NAV: NavEntry[] = [
  { label: 'Dashboard', href: ROUTES.dashboard.root, icon: LayoutDashboard, enabled: true, module: MODULES.DASHBOARD },
  { label: 'Products', href: ROUTES.dashboard.products, icon: Package, enabled: true, module: MODULES.PRODUCTS },
  { label: 'Categories', href: ROUTES.dashboard.categories, icon: FolderTree, enabled: true, module: MODULES.CATEGORIES },
  { label: 'Templates', href: ROUTES.dashboard.templates, icon: FileText, enabled: true, module: MODULES.TEMPLATES },
  { label: 'Quotations', href: ROUTES.dashboard.quotations, icon: ReceiptText, enabled: true, module: MODULES.QUOTATIONS },
  {
    label: 'Settings',
    icon: Settings,
    // Future settings pages can simply be appended here.
    children: [
      { label: 'Users', href: ROUTES.dashboard.users, icon: Users, enabled: true, module: MODULES.USERS },
      { label: 'Roles & Permissions', href: ROUTES.dashboard.roles, icon: ShieldCheck, enabled: true, module: MODULES.ROLES },
    ],
  },
];
