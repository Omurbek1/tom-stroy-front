'use client';

import { create } from 'zustand';

export type CreateModalKind = 'project' | 'income' | 'expense';

interface CreateModalState {
  /** `null` ⇒ host hidden. Anything else ⇒ host renders the matching form. */
  kind: CreateModalKind | null;
  open: (kind: CreateModalKind) => void;
  close: () => void;
}

/**
 * Global "open a create-modal" channel. Any component — the mobile FAB,
 * a header button, a keyboard shortcut — can call `open('expense')` and
 * the modals-host mounted near app root will render the matching form
 * drawer. Decouples the trigger from the form so we don't need a button
 * sitting on every page.
 */
export const useCreateModalStore = create<CreateModalState>((set) => ({
  kind: null,
  open: (kind) => set({ kind }),
  close: () => set({ kind: null }),
}));
