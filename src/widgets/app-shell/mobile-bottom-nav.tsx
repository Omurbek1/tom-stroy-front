'use client';

import {
  AppstoreOutlined,
  HomeOutlined,
  ProjectOutlined,
  ShopOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, ReactNode } from 'react';

interface Tab {
  key: string;
  href: string;
  label: string;
  icon: ReactNode;
  /** Optional alternative routes that also light up this tab. */
  matches?: string[];
}

const TABS: Tab[] = [
  { key: 'dashboard', href: '/dashboard', label: 'Главная', icon: <HomeOutlined /> },
  {
    key: 'projects',
    href: '/projects',
    label: 'Объекты',
    icon: <ProjectOutlined />,
  },
  { key: 'warehouse', href: '/warehouse', label: 'Склад', icon: <ShopOutlined /> },
  {
    key: 'finance',
    href: '/finance',
    label: 'Финансы',
    icon: <WalletOutlined />,
    matches: ['/payroll'],
  },
  {
    key: 'more',
    href: '/analytics',
    label: 'Ещё',
    icon: <AppstoreOutlined />,
    matches: ['/analytics', '/reports', '/brigades', '/employees', '/vehicles', '/settings'],
  },
];

interface Props {
  onMore?: () => void;
}

function MobileBottomNavImpl({ onMore }: Props) {
  const pathname = usePathname() ?? '/';

  const activeKey =
    TABS.find(
      (t) =>
        pathname === t.href ||
        pathname.startsWith(`${t.href}/`) ||
        t.matches?.some((m) => pathname === m || pathname.startsWith(`${m}/`)),
    )?.key ?? '';

  return (
    <nav className="mob-nav" aria-label="Главное меню">
      {TABS.map((t) => {
        const isActive = activeKey === t.key;
        const className = `mob-nav__tab ${isActive ? 'is-active' : ''}`;
        if (t.key === 'more' && onMore) {
          return (
            <button
              key={t.key}
              type="button"
              className={className}
              onClick={onMore}
              aria-label={t.label}
            >
              <span className="mob-nav__icon">{t.icon}</span>
              <span className="mob-nav__label">{t.label}</span>
            </button>
          );
        }
        return (
          <Link
            key={t.key}
            href={t.href}
            prefetch
            className={className}
            aria-label={t.label}
          >
            <span className="mob-nav__icon">{t.icon}</span>
            <span className="mob-nav__label">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export const MobileBottomNav = memo(MobileBottomNavImpl);
