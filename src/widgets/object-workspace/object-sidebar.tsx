'use client';

import {
  ArrowLeftOutlined,
  BarChartOutlined,
  CarOutlined,
  CheckSquareOutlined,
  DashboardOutlined,
  DollarOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { Progress, Skeleton } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useMemo } from 'react';
import { useProject } from '@entities/project/hooks';
import { ProjectStatus, StatusBadge } from '@shared/ui/status-badge';
import { useAuthStore } from '@app-init/store/auth-store';
import { can, type Permission } from '@shared/config/permissions';

interface ObjectNavItem {
  key: string;
  segment: string;          // route segment relative to /objects/[id]
  label: string;
  icon: React.ReactNode;
  group?: string;
  permission?: Permission;
}

const NAV: ObjectNavItem[] = [
  { key: 'dashboard',  segment: '',           label: 'Дашборд',     icon: <DashboardOutlined />, group: 'daily' },
  { key: 'reports',    segment: '/reports',   label: 'Отчёты',      icon: <FileTextOutlined />,  group: 'daily' },
  { key: 'tasks',      segment: '/tasks',     label: 'Задачи',      icon: <CheckSquareOutlined />, group: 'daily' },

  { key: 'team',       segment: '/team',      label: 'Команда',     icon: <TeamOutlined />,       group: 'object' },
  { key: 'brigades',   segment: '/brigades',  label: 'Бригады',     icon: <UsergroupAddOutlined />, group: 'object' },
  { key: 'vehicles',   segment: '/vehicles',  label: 'Техника',     icon: <CarOutlined />,        group: 'object' },

  { key: 'warehouse',  segment: '/warehouse', label: 'Склад',       icon: <ShopOutlined />,       group: 'materials' },
  { key: 'purchases',  segment: '/purchases', label: 'Закупки',     icon: <ShoppingCartOutlined />, group: 'materials' },

  { key: 'finance',    segment: '/finance',   label: 'Финансы',     icon: <DollarOutlined />,     group: 'finance', permission: 'object:finance:view' },
  { key: 'documents',  segment: '/documents', label: 'Документы',   icon: <FolderOpenOutlined />, group: 'finance' },

  { key: 'analytics',  segment: '/analytics', label: 'Аналитика',   icon: <BarChartOutlined />,   group: 'analytics' },
];

const GROUP_LABELS: Record<string, string> = {
  daily: 'Ежедневно',
  object: 'Объект',
  materials: 'Материалы',
  finance: 'Финансы',
  analytics: 'Аналитика',
};

interface Props {
  projectId: string;
  onNavigate?: () => void;
}

function ObjectSidebarImpl({ projectId, onNavigate }: Props) {
  const pathname = usePathname() ?? '';
  const { data: project, isLoading } = useProject(projectId);
  const role = useAuthStore((s) => s.user?.role);

  const base = `/objects/${projectId}`;

  const activeSegment = useMemo(() => {
    const rest = pathname.startsWith(base) ? pathname.slice(base.length) : '';
    return rest.split('/')[1] ? `/${rest.split('/')[1]}` : '';
  }, [pathname, base]);

  const visibleNav = useMemo(
    () => NAV.filter((item) => !item.permission || can(role, item.permission)),
    [role],
  );

  const groups = useMemo(() => {
    const out: { key: string; items: ObjectNavItem[] }[] = [];
    for (const item of visibleNav) {
      const g = item.group ?? 'daily';
      const last = out[out.length - 1];
      if (last && last.key === g) last.items.push(item);
      else out.push({ key: g, items: [item] });
    }
    return out;
  }, [visibleNav]);

  return (
    <aside className="object-sidebar">
      <Link href="/objects" className="object-sidebar__back" prefetch>
        <ArrowLeftOutlined /> <span>Все объекты</span>
      </Link>

      <div className="object-sidebar__header">
        {isLoading || !project ? (
          <Skeleton active paragraph={{ rows: 2 }} title={false} />
        ) : (
          <>
            <div className="object-sidebar__name" title={project.name}>
              {project.name}
            </div>
            <div className="object-sidebar__meta">
              <StatusBadge status={project.status as ProjectStatus} />
              <span className="object-sidebar__progress-text">
                {Math.round(Number(project.progress))}%
              </span>
            </div>
            <Progress
              percent={Math.round(Number(project.progress))}
              size="small"
              showInfo={false}
              strokeColor="var(--ant-color-primary, #1677ff)"
            />
          </>
        )}
      </div>

      <nav className="object-sidebar__nav">
        {groups.map((g) => (
          <div key={g.key} className="object-sidebar__group">
            <div className="object-sidebar__group-title">{GROUP_LABELS[g.key]}</div>
            {g.items.map((item) => {
              const active = activeSegment === item.segment;
              return (
                <Link
                  key={item.key}
                  href={`${base}${item.segment}`}
                  prefetch
                  onClick={() => onNavigate?.()}
                  className={`object-sidebar__link ${active ? 'is-active' : ''}`}
                >
                  <span className="object-sidebar__icon">{item.icon}</span>
                  <span className="object-sidebar__label">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}

export const ObjectSidebar = memo(ObjectSidebarImpl);
