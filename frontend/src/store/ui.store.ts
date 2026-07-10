import { create } from 'zustand';

/**
 * Global UI state (sidebar, global loaders, etc.). Kept intentionally small —
 * server data belongs in TanStack Query, not here. This demonstrates the
 * Zustand pattern future stores follow.
 */
interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
