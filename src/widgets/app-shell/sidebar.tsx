'use client';

import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useMemo } from 'react';
import { useAuthStore } from '@app-init/store/auth-store';
import { GLOBAL_NAV } from '@shared/config/nav-config';
import { can } from '@shared/config/permissions';

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  /**
   * Called after a nav-item click. Used by the mobile drawer to close
   * itself once the user has chosen a destination.
   */
  onNavigate?: () => void;
}

function SidebarImpl({ collapsed, onToggle, onNavigate }: Props) {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.user?.role);

  // Active key = first URL segment. /objects/:id/anything still keeps
  // "objects" active in the global sidebar.
  const activeKey = useMemo(() => pathname?.split('/')[1] || 'dashboard', [pathname]);

  const items = useMemo(
    () => GLOBAL_NAV.filter((i) => !i.permission || can(role, i.permission)),
    [role],
  );

  return (
    <aside className={`app-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="app-sidebar__brand">
        <span className="app-sidebar__logo">🏗</span>
        {!collapsed && <span className="app-sidebar__brand-text">Tom-Stroy</span>}
      </div>

      <nav className="app-sidebar__nav">
        {items.map((item) => {
          const active = activeKey === item.key;
          return (
            <Link
              key={item.key}
              href={item.href}
              prefetch
              onClick={() => onNavigate?.()}
              className={`app-sidebar__link ${active ? 'is-active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="app-sidebar__icon">{item.icon}</span>
              {!collapsed && <span className="app-sidebar__label">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        className="app-sidebar__collapse"
        onClick={onToggle}
        aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
      >
        {collapsed ? <RightOutlined /> : <LeftOutlined />}
        {!collapsed && <span>Свернуть</span>}
      </button>
    </aside>
  );
}

export const Sidebar = memo(SidebarImpl);
