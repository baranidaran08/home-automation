import { create } from 'zustand';

interface BreadcrumbState {
  /**
   * Optional label that replaces the LAST (current-page) crumb, keyed to the
   * path it was set for so a stale override from a previous page never leaks.
   * Used for dynamic routes — e.g. showing a quotation number or product name
   * instead of a raw id.
   */
  override: { path: string; label: string } | null;
  setOverride: (path: string, label: string) => void;
  clear: () => void;
}

/**
 * Lets a page override the final breadcrumb label. The breadcrumb itself lives
 * in the layout (rendered once, globally); this store is the thin channel a page
 * uses to feed it a dynamic label. Drive it with the `useBreadcrumbLabel` hook.
 */
export const useBreadcrumbStore = create<BreadcrumbState>((set) => ({
  override: null,
  setOverride: (path, label) => set({ override: { path, label } }),
  clear: () => set({ override: null }),
}));
