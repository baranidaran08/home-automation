import {
  LayoutDashboard,
  FolderTree,
  Package,
  FileText,
  ReceiptText,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from './routes';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** When false, the item renders disabled with a "Soon" badge. */
  enabled: boolean;
}

/**
 * Sidebar menu. Only Dashboard is enabled; the rest are disabled placeholders
 * until their modules ship. Add `enabled: true` (and remove the placeholder
 * page) as each module is built — no structural changes needed.
 */
export const SIDEBAR_NAV: NavItem[] = [
  { label: 'Dashboard', href: ROUTES.dashboard.root, icon: LayoutDashboard, enabled: true },
  { label: 'Categories', href: ROUTES.dashboard.categories, icon: FolderTree, enabled: true },
  { label: 'Products', href: ROUTES.dashboard.products, icon: Package, enabled: true },
  { label: 'Templates', href: ROUTES.dashboard.templates, icon: FileText, enabled: true },
  { label: 'Quotation', href: ROUTES.dashboard.quotations, icon: ReceiptText, enabled: true },
];
