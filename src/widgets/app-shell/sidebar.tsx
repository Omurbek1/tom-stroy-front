'use client';

import {
  BarChartOutlined,
  CarOutlined,
  DashboardOutlined,
  DollarOutlined,
  FileTextOutlined,
  LeftOutlined,
  ProjectOutlined,
  RightOutlined,
  SettingOutlined,
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, ReactNode, useMemo } from 'react';

interface NavItem {
  key: string;
  href: string;
  label: string;
  icon: ReactNode;
  group?: string;
}

const NAV: NavItem[] = [
  { key: 'dashboard', href: '/dashboard', label: 'Дашборд', icon: <DashboardOutlined />, group: 'main' },
  { key: 'projects', href: '/projects', label: 'Объекты', icon: <ProjectOutlined />, group: 'main' },
  { key: 'brigades', href: '/brigades', label: 'Бригады', icon: <TeamOutlined />, group: 'team' },
  { key: 'employees', href: '/employees', label: 'Сотрудники', icon: <UserOutlined />, group: 'team' },
  { key: 'warehouse', href: '/warehouse', label: 'Склад', icon: <ShopOutlined />, group: 'ops' },
  { key: 'vehicles', href: '/vehicles', label: 'Техника', icon: <CarOutlined />, group: 'ops' },
  { key: 'finance', href: '/finance', label: 'Финансы', icon: <DollarOutlined />, group: 'finance' },
  { key: 'payroll', href: '/payroll', label: 'Зарплаты', icon: <WalletOutlined />, group: 'finance' },
  { key: 'analytics', href: '/analytics', label: 'Аналитика', icon: <BarChartOutlined />, group: 'analytics' },
  { key: 'reports', href: '/reports', label: 'Отчёты', icon: <FileTextOutlined />, group: 'analytics' },
  { key: 'settings', href: '/settings', label: 'Настройки', icon: <SettingOutlined />, group: 'system' },
];

const GROUP_LABELS: Record<string, string> = {
  main: 'Главное',
  team: 'Команда',
  ops: 'Операции',
  finance: 'Финансы',
  analytics: 'Аналитика',
  system: 'Система',
};

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
  const activeKey = useMemo(() => pathname?.split('/')[1] || 'dashboard', [pathname]);

  // Group items once
  const groups = useMemo(() => {
    const out: { key: string; items: NavItem[] }[] = [];
    for (const item of NAV) {
      const g = item.group ?? 'main';
      const last = out[out.length - 1];
      if (last && last.key === g) last.items.push(item);
      else out.push({ key: g, items: [item] });
    }
    return out;
  }, []);

  return (
    <aside className={`app-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="app-sidebar__brand">
        <span className="app-sidebar__logo">🏗</span>
        {!collapsed && <span className="app-sidebar__brand-text">Tom-Stroy</span>}
      </div>

      <nav className="app-sidebar__nav">
        {groups.map((g) => (
          <div key={g.key} className="app-sidebar__group">
            {!collapsed && (
              <div className="app-sidebar__group-title">{GROUP_LABELS[g.key]}</div>
            )}
            {g.items.map((item) => {
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
          </div>
        ))}
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
