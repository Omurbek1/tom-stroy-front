'use client';

import { create } from 'zustand';

interface CommandPaletteState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Global open/close state for the ⌘K command palette. Lives in its own
 * store so any component (header, hotkey listener, mobile button) can
 * trigger it without prop-drilling.
 */
export const useCommandPaletteStore = create<CommandPaletteState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));
