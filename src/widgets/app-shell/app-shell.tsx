'use client';

import { Drawer } from 'antd';
import { useRouter } from 'next/navigation';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@app-init/store/auth-store';
import { Sidebar } from './sidebar';
import { UniversalHeader } from './universal-header';
import { MobileBottomNav } from './mobile-bottom-nav';
import { MobileFab } from './mobile-fab';
import { CreateModalsHost } from './create-modals-host';
import { CommandPalette } from '@widgets/command-palette/command-palette';

const STORAGE_KEY = 'tomstroy.sidebar-collapsed';

/**
 * Top-level app shell.
 *
 * Desktop (≥901px):
 *   grid [sidebar | main]
 *     main: [UniversalHeader] + [scrollable content]
 *
 * Mobile (≤900px):
 *   stack:
 *     [UniversalHeader — compact, ☰ opens drawer]
 *     [scrollable content with bottom padding for nav]
 *     [MobileBottomNav — 5 tabs, fixed bottom]
 *     [MobileFab — context-aware "+", above the nav]
 *     drawer mirrors the full sidebar
 *
 * The CSS `.app-shell` does the heavy lifting via media queries — JS just
 * mounts everything and lets layout decide what's visible.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === '1') setCollapsed(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Wait for zustand to read localStorage — otherwise `user` is null
    // for one tick after a hard reload and we bounce the user out.
    if (!hasHydrated) return;
    if (!user) router.replace('/login');
  }, [hasHydrated, user, router]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
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
        width={280}
        closable={false}
        styles={{ body: { padding: 0 } }}
        rootClassName="app-shell__mobile-drawer"
      >
        <Sidebar collapsed={false} onToggle={closeMobileNav} onNavigate={closeMobileNav} />
      </Drawer>

      <div className="app-shell__main">
        <UniversalHeader
          collapsed={collapsed}
          onToggleSidebar={toggleCollapsed}
          onToggleMobileNav={openMobileNav}
        />
        <main className="app-shell__content">{children}</main>
      </div>

      {/* Mobile chrome — CSS hides these on desktop. */}
      <div className="app-shell__mobile-chrome">
        <MobileFab />
        <MobileBottomNav onMore={openMobileNav} />
      </div>

      <CommandPalette />
      <CreateModalsHost />
    </div>
  );
}
