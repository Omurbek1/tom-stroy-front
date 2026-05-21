'use client';

import { useCallback, useEffect, useState } from 'react';

const PINNED_KEY = 'tomstroy:pinned_objects';
const RECENT_KEY = 'tomstroy:recent_objects';
const RECENT_LIMIT = 5;

function read(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function write(key: string, value: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    // Cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', { key }));
  } catch {
    // ignore quota / private-mode errors
  }
}

/**
 * Tracks user's pinned & recently-opened object ids in localStorage.
 *
 *   pinned  — user-curated, persists until removed
 *   recent  — LRU of last 5 opened (auto-managed via track())
 *
 * Reads are synchronous on mount; writes broadcast a `storage` event
 * so other tabs / instances of this hook stay in sync.
 */
export function usePinnedObjects() {
  const [pinned, setPinned] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setPinned(read(PINNED_KEY));
    setRecent(read(RECENT_KEY));
    const sync = (e: StorageEvent) => {
      if (e.key === PINNED_KEY) setPinned(read(PINNED_KEY));
      if (e.key === RECENT_KEY) setRecent(read(RECENT_KEY));
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const togglePin = useCallback((id: string) => {
    const next = read(PINNED_KEY);
    const idx = next.indexOf(id);
    if (idx >= 0) next.splice(idx, 1);
    else next.unshift(id);
    write(PINNED_KEY, next);
    setPinned(next);
  }, []);

  const track = useCallback((id: string) => {
    const current = read(RECENT_KEY);
    const filtered = current.filter((x) => x !== id);
    filtered.unshift(id);
    const next = filtered.slice(0, RECENT_LIMIT);
    write(RECENT_KEY, next);
    setRecent(next);
  }, []);

  const isPinned = useCallback((id: string) => pinned.includes(id), [pinned]);

  return { pinned, recent, togglePin, track, isPinned };
}
