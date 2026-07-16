import { create } from 'zustand';

interface TransitionOverlayState {
  /** Whether the fullscreen brand transition is currently playing. */
  active: boolean;
  /** Begin the transition. Call AFTER the action you're masking has succeeded. */
  start: () => void;
  /** Called by the overlay itself when the sequence finishes. */
  finish: () => void;
}

/**
 * Drives the fullscreen XEN transition overlay (see
 * components/shared/transition-overlay.tsx, mounted once in AppProviders).
 *
 * Any feature can call `start()` to play the brand transition over whatever
 * is happening underneath — the overlay is purely visual and never blocks or
 * delays navigation, API calls, or auth state.
 */
export const useTransitionOverlayStore = create<TransitionOverlayState>((set) => ({
  active: false,
  start: () => set({ active: true }),
  finish: () => set({ active: false }),
}));
