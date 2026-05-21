import type { ReactNode } from 'react';
import {
  ApartmentOutlined,
  BarChartOutlined,
  DashboardOutlined,
  DollarOutlined,
  ProjectOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { createElement } from 'react';
import type { Permission } from './permissions';

export interface NavItem {
  key: string;
  href: string;
  label: string;
  icon: ReactNode;
  permission?: Permission;
}

/**
 * Global sidebar — 6 items only.
 *
 * Everything operational (бригады / склад / техника / задачи / документы)
 * lives **inside an object** via ObjectTabs (`/objects/[id]/...`). The
 * global sidebar holds only company-level entry points, so navigation
 * stays clean even with 100+ objects.
 *
 *   /dashboard  — landing dashboard
 *   /objects    — projects list
 *   /company    — hub for company-wide directories
 *                  (employees, brigades catalog, suppliers,
 *                   warehouses catalog, vehicles catalog)
 *   /finance    — consolidated company P&L + payroll + reports
 *   /analytics  — cross-project analytics
 *   /settings   — settings
 */
export const GLOBAL_NAV: NavItem[] = [
  { key: 'dashboard', href: '/dashboard', label: 'Главная',   icon: createElement(DashboardOutlined) },
  { key: 'objects',   href: '/objects',   label: 'Объекты',   icon: createElement(ProjectOutlined) },
  { key: 'company',   href: '/company',   label: 'Компания',  icon: createElement(ApartmentOutlined), permission: 'company:view' },
  { key: 'finance',   href: '/finance',   label: 'Финансы',   icon: createElement(DollarOutlined),    permission: 'finance:view' },
  { key: 'analytics', href: '/analytics', label: 'Аналитика', icon: createElement(BarChartOutlined),  permission: 'analytics:view' },
  { key: 'settings',  href: '/settings',  label: 'Настройки', icon: createElement(SettingOutlined),   permission: 'settings:view' },
];
