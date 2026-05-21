'use client';

import {
  ClockCircleOutlined,
  ProjectOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Empty, Input, Modal, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  KeyboardEvent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useCommandPaletteStore } from '@app-init/store/command-palette-store';
import { useRecentsStore } from '@app-init/store/recents-store';
import { listProjects } from '@entities/project/api';
import { listEmployees } from '@entities/employee/api';
import { listBrigades } from '@entities/brigade/api';

interface ResultItem {
  id: string;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  group: 'Объекты' | 'Сотрудники' | 'Бригады';
  href: string;
}

const ICON_BY_GROUP: Record<ResultItem['group'], ReactNode> = {
  Объекты: <ProjectOutlined />,
  Сотрудники: <UserOutlined />,
  Бригады: <TeamOutlined />,
};

/**
 * Cmd/Ctrl+K palette. Searches across projects, employees and brigades
 * in parallel. With empty query — shows recently visited items.
 */
export function CommandPalette() {
  const router = useRouter();
  const isOpen = useCommandPaletteStore((s) => s.isOpen);
  const close = useCommandPaletteStore((s) => s.close);
  const toggle = useCommandPaletteStore((s) => s.toggle);

  const recents = useRecentsStore((s) => s.items);
  const pushRecent = useRecentsStore((s) => s.push);

  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle, close]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setActiveIdx(0);
    }
  }, [isOpen]);

  const enabled = isOpen && query.trim().length >= 2;

  const projectsQuery = useQuery({
    queryKey: ['palette', 'projects', query],
    queryFn: () => listProjects({ search: query, limit: 5 }),
    enabled,
    staleTime: 30_000,
  });
  const employeesQuery = useQuery({
    queryKey: ['palette', 'employees', query],
    queryFn: () => listEmployees({ search: query, limit: 5 }),
    enabled,
    staleTime: 30_000,
  });
  const brigadesQuery = useQuery({
    queryKey: ['palette', 'brigades', query],
    queryFn: () => listBrigades({ search: query, limit: 5 }),
    enabled,
    staleTime: 30_000,
  });

  // Two modes:
  //   - empty/short query: show "Недавнее" (recents).
  //   - actual query: merged search results across 3 entities.
  const items: ResultItem[] = useMemo(() => {
    if (!enabled) {
      return recents.slice(0, 6).map((r) => ({
        id: r.id,
        icon: ICON_BY_GROUP[r.group],
        title: r.title,
        subtitle: r.subtitle,
        group: r.group,
        href: r.href,
      }));
    }
    const out: ResultItem[] = [];
    for (const p of projectsQuery.data?.data ?? []) {
      out.push({
        id: `project-${p.id}`,
        icon: <ProjectOutlined />,
        title: p.name,
        subtitle: p.address ?? p.client?.name ?? '—',
        group: 'Объекты',
        href: `/projects/${p.id}`,
      });
    }
    for (const e of employeesQuery.data?.data ?? []) {
      out.push({
        id: `emp-${e.id}`,
        icon: <UserOutlined />,
        title: e.fullName,
        subtitle: e.role,
        group: 'Сотрудники',
        href: '/employees',
      });
    }
    for (const b of brigadesQuery.data?.data ?? []) {
      out.push({
        id: `brigade-${b.id}`,
        icon: <TeamOutlined />,
        title: b.name,
        subtitle: b.specialization ?? undefined,
        group: 'Бригады',
        href: '/brigades',
      });
    }
    return out.slice(0, 12);
  }, [enabled, projectsQuery.data, employeesQuery.data, brigadesQuery.data, recents]);

  useEffect(() => {
    if (activeIdx >= items.length) setActiveIdx(Math.max(0, items.length - 1));
  }, [items.length, activeIdx]);

  const navigate = (item: ResultItem) => {
    pushRecent({
      id: item.id,
      href: item.href,
      title: item.title,
      subtitle: item.subtitle,
      group: item.group,
    });
    close();
    router.push(item.href);
  };

  const onInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(items.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      const it = items[activeIdx];
      if (it) {
        e.preventDefault();
        navigate(it);
      }
    }
  };

  // Group by section. In recents-mode the section title is "Недавнее".
  const groups = useMemo(() => {
    if (!enabled) {
      return items.length > 0 ? ([['Недавнее', items]] as const) : ([] as const);
    }
    const map = new Map<string, ResultItem[]>();
    for (const it of items) {
      const arr = map.get(it.group) ?? [];
      arr.push(it);
      map.set(it.group, arr);
    }
    return Array.from(map.entries());
  }, [items, enabled]);

  const isLoading =
    enabled &&
    (projectsQuery.isFetching || employeesQuery.isFetching || brigadesQuery.isFetching);

  return (
    <Modal
      open={isOpen}
      onCancel={close}
      footer={null}
      closable={false}
      width={620}
      destroyOnHidden
      styles={{ body: { padding: 0 }, content: { padding: 0, overflow: 'hidden' } }}
      className="cmdk-modal"
      maskClosable
    >
      <div className="cmdk">
        <div className="cmdk__input-wrap">
          <SearchOutlined className="cmdk__input-icon" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Объекты, сотрудники, бригады…"
            autoFocus
            bordered={false}
            className="cmdk__input"
            allowClear
          />
          <span className="cmdk__kbd">esc</span>
        </div>

        <div className="cmdk__results">
          {!enabled && items.length === 0 && (
            <div className="cmdk__hint">
              Введите минимум 2 символа для поиска. Стрелки ↑/↓ и Enter для перехода.
            </div>
          )}
          {enabled && isLoading && items.length === 0 && (
            <div className="cmdk__loading">
              <Spin />
            </div>
          )}
          {enabled && !isLoading && items.length === 0 && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Ничего не найдено"
              style={{ padding: '32px 0' }}
            />
          )}
          {groups.map(([group, list]) => (
            <div key={group} className="cmdk__group">
              <div className="cmdk__group-title">
                {group === 'Недавнее' && (
                  <ClockCircleOutlined style={{ marginRight: 6 }} />
                )}
                {group}
              </div>
              {list.map((it) => {
                const idx = items.indexOf(it);
                const active = idx === activeIdx;
                return (
                  <button
                    key={it.id}
                    type="button"
                    className={`cmdk__item ${active ? 'is-active' : ''}`}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => navigate(it)}
                  >
                    <span className="cmdk__item-icon">{it.icon}</span>
                    <span className="cmdk__item-text">
                      <span className="cmdk__item-title">{it.title}</span>
                      {it.subtitle && (
                        <span className="cmdk__item-subtitle">{it.subtitle}</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
