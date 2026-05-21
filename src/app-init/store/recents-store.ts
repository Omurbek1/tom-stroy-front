'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecentItem {
  /** Stable id including the entity type prefix, e.g. `project-{cuid}`. */
  id: string;
  href: string;
  title: string;
  subtitle?: string;
  group: 'Объекты' | 'Сотрудники' | 'Бригады';
  /** Visited timestamp (ms since epoch). */
  at: number;
}

interface RecentsState {
  items: RecentItem[];
  push: (item: Omit<RecentItem, 'at'>) => void;
  clear: () => void;
}

const MAX_ITEMS = 8;

/**
 * Tracks the last entities the user navigated to via the command palette
 * or by clicking around. Backs the "Недавнее" section at the top of the
 * empty-query palette state — a Linear/Notion pattern.
 *
 * Persists in localStorage so reopening the app still shows the user
 * their recents.
 */
export const useRecentsStore = create<RecentsState>()(
  persist(
    (set, get) => ({
      items: [],
      push: (item) => {
        const now = Date.now();
        const without = get().items.filter((x) => x.id !== item.id);
        set({ items: [{ ...item, at: now }, ...without].slice(0, MAX_ITEMS) });
      },
      clear: () => set({ items: [] }),
    }),
    { name: 'tomstroy.recents' },
  ),
);
