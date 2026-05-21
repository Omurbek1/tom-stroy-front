import type { ReactNode } from 'react';
import {
  BarChartOutlined,
  CarOutlined,
  DashboardOutlined,
  DollarOutlined,
  FileTextOutlined,
  ProjectOutlined,
  SettingOutlined,
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { createElement } from 'react';
import type { Permission } from './permissions';

export interface NavGroup {
  key: string;
  label: string;
  items: NavItem[];
}

export interface NavItem {
  key: string;
  href: string;
  label: string;
  icon: ReactNode;
  permission?: Permission;
}

/**
 * Slim global navigation. Object-centric content lives inside
 * `/objects/[id]/...` (see ObjectSidebar). Anything that doesn't have
 * a natural object owner — company-wide directories, consolidated
 * finance, settings — stays here.
 */
export const GLOBAL_NAV: NavGroup[] = [
  {
    key: 'main',
    label: 'Главное',
    items: [
      { key: 'dashboard', href: '/dashboard', label: 'Дашборд', icon: createElement(DashboardOutlined) },
      { key: 'objects',   href: '/objects',   label: 'Объекты', icon: createElement(ProjectOutlined) },
    ],
  },
  {
    key: 'company',
    label: 'Компания',
    items: [
      { key: 'brigades',  href: '/brigades',  label: 'Бригады',     icon: createElement(TeamOutlined),  permission: 'company:view' },
      { key: 'employees', href: '/employees', label: 'Сотрудники',  icon: createElement(UserOutlined),  permission: 'company:view' },
      { key: 'warehouse', href: '/warehouse', label: 'Склады',      icon: createElement(ShopOutlined),  permission: 'warehouse:write' },
      { key: 'vehicles',  href: '/vehicles',  label: 'Техника',     icon: createElement(CarOutlined),   permission: 'company:view' },
    ],
  },
  {
    key: 'finance',
    label: 'Финансы',
    items: [
      { key: 'finance',   href: '/finance',  label: 'Финансы',  icon: createElement(DollarOutlined), permission: 'finance:view' },
      { key: 'payroll',   href: '/payroll',  label: 'Зарплаты', icon: createElement(WalletOutlined), permission: 'finance:view' },
      { key: 'reports',   href: '/reports',  label: 'Отчёты',   icon: createElement(FileTextOutlined), permission: 'finance:view' },
    ],
  },
  {
    key: 'analytics',
    label: 'Аналитика',
    items: [
      { key: 'analytics', href: '/analytics', label: 'Аналитика', icon: createElement(BarChartOutlined), permission: 'analytics:view' },
    ],
  },
  {
    key: 'system',
    label: 'Система',
    items: [
      { key: 'settings',  href: '/settings',  label: 'Настройки', icon: createElement(SettingOutlined), permission: 'settings:view' },
    ],
  },
];
