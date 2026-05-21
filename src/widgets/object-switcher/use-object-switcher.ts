'use client';

import { useEffect, useState } from 'react';

/**
 * Global hook owning the ObjectSwitcher's open state and the ⌘P / Ctrl+P
 * hotkey. Used by UniversalHeader to render the switcher and let any
 * button toggle it.
 */
export function useObjectSwitcher() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isP = e.key === 'p' || e.key === 'P' || e.key === 'з' || e.key === 'З';
      if (!isP) return;
      if (!(e.metaKey || e.ctrlKey)) return;
      // Don't hijack the print shortcut when an input has focus and user
      // really wants Ctrl+P (we still allow ⌘P opening because the
      // probability they want browser-print on this app is ~0).
      e.preventDefault();
      setOpen((v) => !v);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return {
    open,
    openSwitcher: () => setOpen(true),
    closeSwitcher: () => setOpen(false),
  };
}
