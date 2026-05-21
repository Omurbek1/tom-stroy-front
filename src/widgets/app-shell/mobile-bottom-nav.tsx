'use client';

import {
  ApartmentOutlined,
  AppstoreOutlined,
  HomeOutlined,
  ProjectOutlined,
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

/**
 * Mobile bottom navigation — mirror of the slim global sidebar. Only
 * the 5 most-used global entry points, no per-object content (which
 * lives in ObjectTabs once you open an object).
 */
const TABS: Tab[] = [
  { key: 'dashboard', href: '/dashboard', label: 'Главная', icon: <HomeOutlined /> },
  {
    key: 'objects',
    href: '/objects',
    label: 'Объекты',
    icon: <ProjectOutlined />,
    // Stay highlighted across object workspace + legacy /projects redirects.
    matches: ['/objects', '/projects'],
  },
  {
    key: 'company',
    href: '/company',
    label: 'Компания',
    icon: <ApartmentOutlined />,
    // /company hub links to these directories — keep tab lit on them too.
    matches: ['/brigades', '/employees', '/warehouse', '/vehicles'],
  },
  {
    key: 'finance',
    href: '/finance',
    label: 'Финансы',
    icon: <WalletOutlined />,
    matches: ['/payroll', '/reports'],
  },
  {
    key: 'more',
    href: '/analytics',
    label: 'Ещё',
    icon: <AppstoreOutlined />,
    matches: ['/analytics', '/settings'],
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

// suppress unused warnings if some icons are removed during refactor
void BarChartOutlined;
