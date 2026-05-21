'use client';

import { useEffect } from 'react';
import { useThemeStore } from '../store/theme-store';

/**
 * Mirrors the current ThemeStore mode onto `<html data-theme="...">` so
 * non-AntD CSS (sidebar, login, page chrome) can switch palette via
 * CSS variables. Mounted once near app root.
 */
export function ThemeAttribute() {
  const mode = useThemeStore((s) => s.mode);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.theme = mode;
  }, [mode]);
  return null;
}
