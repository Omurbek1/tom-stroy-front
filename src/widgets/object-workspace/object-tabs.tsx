'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';
import { useAuthStore } from '@app-init/store/auth-store';
import { can, type Permission } from '@shared/config/permissions';

interface TabItem {
  key: string;
  segment: string;            // relative to /objects/[id]
  label: string;
  badge?: string | number;
  permission?: Permission;
}

const TABS: TabItem[] = [
  { key: 'dashboard',  segment: '',           label: 'Дашборд' },
  { key: 'reports',    segment: '/reports',   label: 'Отчёты' },
  { key: 'tasks',      segment: '/tasks',     label: 'Задачи' },
  { key: 'team',       segment: '/team',      label: 'Команда' },
  { key: 'brigades',   segment: '/brigades',  label: 'Бригады' },
  { key: 'warehouse',  segment: '/warehouse', label: 'Склад' },
  { key: 'purchases',  segment: '/purchases', label: 'Закупки' },
  { key: 'vehicles',   segment: '/vehicles',  label: 'Техника' },
  { key: 'finance',    segment: '/finance',   label: 'Финансы',   permission: 'object:finance:view' },
  { key: 'documents',  segment: '/documents', label: 'Документы' },
  { key: 'analytics',  segment: '/analytics', label: 'Аналитика' },
];

interface Props {
  projectId: string;
}

/**
 * Horizontal sticky tab bar that replaces the old ObjectSidebar.
 * Pattern matches GitHub / Linear / Jira project pages — wider content,
 * cleaner mobile UX, no sidebar-inside-sidebar.
 *
 * Auto-scrolls the active tab into view (handy when navigating between
 * many tabs on a narrow viewport).
 */
export function ObjectTabs({ projectId }: Props) {
  const pathname = usePathname() ?? '';
  const role = useAuthStore((s) => s.user?.role);
  const base = `/objects/${projectId}`;
  const listRef = useRef<HTMLDivElement>(null);

  const activeSegment = useMemo(() => {
    const rest = pathname.startsWith(base) ? pathname.slice(base.length) : '';
    const head = rest.split('/')[1];
    return head ? `/${head}` : '';
  }, [pathname, base]);

  const visible = useMemo(
    () => TABS.filter((t) => !t.permission || can(role, t.permission)),
    [role],
  );

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLAnchorElement>('.object-tab.is-active');
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [activeSegment]);

  return (
    <nav className="object-tabs" aria-label="Разделы объекта">
      <div className="object-tabs__scroll" ref={listRef}>
        {visible.map((t) => {
          const active = activeSegment === t.segment;
          return (
            <Link
              key={t.key}
              href={`${base}${t.segment}`}
              prefetch
              className={`object-tab ${active ? 'is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              {t.label}
              {t.badge !== undefined && (
                <span className="object-tab__badge">{t.badge}</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
