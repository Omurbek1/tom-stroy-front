'use client';

import { Empty, Input, Modal, Progress, Tag } from 'antd';
import {
  ClockCircleOutlined,
  SearchOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useProjectsList } from '@entities/project/hooks';
import type { Project, ProjectStatus } from '@entities/project/types';
import { usePinnedObjects } from '@shared/lib/pinned-objects';

const STATUS_TAG: Record<ProjectStatus, { label: string; color: string }> = {
  NEW: { label: 'Новый', color: 'default' },
  PREP: { label: 'Подготовка', color: 'cyan' },
  IN_PROGRESS: { label: 'В работе', color: 'processing' },
  AT_RISK: { label: 'Риски', color: 'gold' },
  LAGGING: { label: 'Отстаёт', color: 'orange' },
  OVERDUE: { label: 'Просрочен', color: 'red' },
  COMPLETED: { label: 'Завершён', color: 'green' },
  FROZEN: { label: 'Заморожен', color: 'default' },
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ObjectSwitcher({ open, onClose }: Props) {
  const router = useRouter();
  const { data, isLoading } = useProjectsList({});
  const { pinned, recent, togglePin, track, isPinned } = usePinnedObjects();

  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const projects = useMemo(() => data?.data ?? [], [data]);
  const byId = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  const pinnedRows = pinned.map((id) => byId.get(id)).filter((p): p is Project => !!p);
  const recentRows = recent
    .filter((id) => !pinned.includes(id))
    .map((id) => byId.get(id))
    .filter((p): p is Project => !!p);
  const pinnedOrRecentIds = new Set([...pinned, ...recent]);

  const q = query.trim().toLowerCase();
  const allRows = useMemo(() => {
    return projects
      .filter((p) => !pinnedOrRecentIds.has(p.id))
      .filter((p) => (q ? p.name.toLowerCase().includes(q) : true));
  }, [projects, pinnedOrRecentIds, q]);

  // Flat list of all visible items for keyboard nav.
  const flat: Project[] = useMemo(() => {
    if (q) {
      // When searching — show only matches (across all sections collapsed)
      return projects.filter((p) => p.name.toLowerCase().includes(q));
    }
    return [...pinnedRows, ...recentRows, ...allRows];
  }, [q, projects, pinnedRows, recentRows, allRows]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveIdx(0);
    // Focus the input after the modal animation
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  const navigate = useCallback(
    (p: Project) => {
      track(p.id);
      onClose();
      router.push(`/projects/${p.id}`);
    },
    [router, onClose, track],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const p = flat[activeIdx];
      if (p) navigate(p);
    }
  };

  // Scroll the active row into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLDivElement>(`[data-idx="${activeIdx}"]`);
    if (active) {
      active.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIdx]);

  const renderRow = (p: Project, idx: number) => {
    const active = idx === activeIdx;
    const meta = STATUS_TAG[p.status];
    return (
      <div
        key={p.id}
        data-idx={idx}
        onMouseEnter={() => setActiveIdx(idx)}
        onClick={() => navigate(p)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 14px',
          cursor: 'pointer',
          background: active ? 'var(--ant-color-fill-quaternary, #f4f6f8)' : undefined,
          borderRadius: 6,
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            togglePin(p.id);
          }}
          aria-label={isPinned(p.id) ? 'Открепить' : 'Закрепить'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: isPinned(p.id) ? '#d48806' : 'var(--ant-color-text-tertiary, #bfbfbf)',
            display: 'flex',
            alignItems: 'center',
            padding: 4,
            margin: -4,
          }}
        >
          {isPinned(p.id) ? <StarFilled /> : <StarOutlined />}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {p.name}
          </div>
          {p.address && (
            <div
              style={{
                fontSize: 12,
                color: 'var(--ant-color-text-secondary, #8c8c8c)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {p.address}
            </div>
          )}
        </div>
        <div style={{ width: 100 }}>
          <Progress percent={Math.round(Number(p.progress))} size="small" showInfo={false} />
        </div>
        <Tag color={meta.color} style={{ margin: 0, minWidth: 90, textAlign: 'center' }}>
          {meta.label}
        </Tag>
      </div>
    );
  };

  let flatIdx = 0;
  const renderSection = (title: string, icon: React.ReactNode, items: Project[]) => {
    if (items.length === 0) return null;
    return (
      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px 2px',
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--ant-color-text-tertiary, #8c8c8c)',
            letterSpacing: 0.4,
            textTransform: 'uppercase',
          }}
        >
          {icon}
          {title}
        </div>
        {items.map((p) => renderRow(p, flatIdx++))}
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      closable={false}
      destroyOnHidden
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ padding: 12, borderBottom: '1px solid var(--ant-color-border-secondary, #f0f0f0)' }}>
        <Input
          ref={inputRef as never}
          size="large"
          placeholder="Поиск объекта…"
          prefix={<SearchOutlined />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
          variant="borderless"
        />
      </div>

      <div
        ref={listRef}
        style={{
          maxHeight: 480,
          overflow: 'auto',
          padding: '8px 4px',
        }}
        onKeyDown={onKeyDown}
        tabIndex={-1}
      >
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--ant-color-text-tertiary, #8c8c8c)' }}>
            Загрузка…
          </div>
        ) : flat.length === 0 ? (
          <Empty
            description={q ? 'Ничего не найдено' : 'Объектов пока нет'}
            style={{ padding: '32px 0' }}
          />
        ) : q ? (
          flat.map((p, idx) => renderRow(p, idx))
        ) : (
          <>
            {renderSection('Избранные', <StarFilled style={{ color: '#d48806' }} />, pinnedRows)}
            {renderSection('Недавние', <ClockCircleOutlined />, recentRows)}
            {renderSection(`Все (${allRows.length})`, null, allRows)}
          </>
        )}
      </div>

      <div
        style={{
          padding: '8px 14px',
          borderTop: '1px solid var(--ant-color-border-secondary, #f0f0f0)',
          display: 'flex',
          gap: 16,
          fontSize: 11,
          color: 'var(--ant-color-text-tertiary, #8c8c8c)',
        }}
      >
        <span><kbd>↑↓</kbd> навигация</span>
        <span><kbd>Enter</kbd> открыть</span>
        <span><kbd>Esc</kbd> закрыть</span>
        <span style={{ marginLeft: 'auto' }}>⌘P</span>
      </div>
    </Modal>
  );
}
