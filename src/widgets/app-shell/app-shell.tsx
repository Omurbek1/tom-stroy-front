'use client';

import { Drawer } from 'antd';
import { useRouter } from 'next/navigation';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@app-init/store/auth-store';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

const STORAGE_KEY = 'tomstroy.sidebar-collapsed';

/**
 * Top-level app shell — fixed grid (sidebar | main).
 *
 * Layout invariants:
 *   - Root: 100vh, overflow:hidden — body never scrolls
 *   - Sidebar: fixed width, own scroll axis
 *   - Main column: min-width:0 (prevents flex children from blowing out
 *     the column when a wide table appears)
 *   - Topbar: fixed-height row at top of main
 *   - Page content: flex:1 + overflow:auto — independent scroll
 *
 * Sidebar state persists in localStorage so a sane default returns on reload.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Hydrate persisted collapse on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === '1') setCollapsed(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!user) router.replace('/login');
  }, [user, router]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        // ignore storage failures (private mode, quota)
      }
      return next;
    });
  }, []);

  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  return (
    <div className={`app-shell ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="app-shell__sidebar">
        <Sidebar collapsed={collapsed} onToggle={toggleCollapsed} />
      </div>

      <Drawer
        open={mobileNavOpen}
        onClose={closeMobileNav}
        placement="left"
        width={260}
        closable={false}
        styles={{ body: { padding: 0 } }}
        rootClassName="app-shell__mobile-drawer"
      >
        <Sidebar collapsed={false} onToggle={closeMobileNav} />
      </Drawer>

      <div className="app-shell__main">
        <Topbar onToggleMobileNav={openMobileNav} />
        <main className="app-shell__content">{children}</main>
      </div>
    </div>
  );
}
