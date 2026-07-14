import {
  LayoutDashboard,
  FolderTree,
  Package,
  FileText,
  ReceiptText,
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
 * Sidebar menu. Each item declares the RBAC `module` it maps to; the sidebar
 * filters out any item the current user cannot read, so users only see the
 * modules they can access. Order is intentional (operational modules first,
 * administration last).
 */
export const SIDEBAR_NAV: NavItem[] = [
  { label: 'Dashboard', href: ROUTES.dashboard.root, icon: LayoutDashboard, enabled: true, module: MODULES.DASHBOARD },
  { label: 'Categories', href: ROUTES.dashboard.categories, icon: FolderTree, enabled: true, module: MODULES.CATEGORIES },
  { label: 'Products', href: ROUTES.dashboard.products, icon: Package, enabled: true, module: MODULES.PRODUCTS },
  { label: 'Templates', href: ROUTES.dashboard.templates, icon: FileText, enabled: true, module: MODULES.TEMPLATES },
  { label: 'Quotation', href: ROUTES.dashboard.quotations, icon: ReceiptText, enabled: true, module: MODULES.QUOTATIONS },
  { label: 'Users', href: ROUTES.dashboard.users, icon: Users, enabled: true, module: MODULES.USERS },
  { label: 'Roles', href: ROUTES.dashboard.roles, icon: ShieldCheck, enabled: true, module: MODULES.ROLES },
];
