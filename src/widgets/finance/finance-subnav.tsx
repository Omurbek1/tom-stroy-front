'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@app-init/store/auth-store';
import { can } from '@shared/config/permissions';

interface Tab {
  href: string;
  label: string;
}

/**
 * Sub-navigation strip rendered at the top of finance pages. Compensates
 * for the slim global sidebar — gives quick access to siblings (P&L,
 * payroll, reports) without a dropdown or hub-card detour.
 */
const TABS: Tab[] = [
  { href: '/finance', label: 'P&L' },
  { href: '/payroll', label: 'Зарплаты' },
  { href: '/reports', label: 'Отчёты Excel' },
];

export function FinanceSubnav() {
  const pathname = usePathname() ?? '';
  const role = useAuthStore((s) => s.user?.role);
  if (!can(role, 'finance:view')) return null;

  return (
    <nav className="finance-subnav" aria-label="Финансы">
      {TABS.map((t) => {
        const active = pathname === t.href || pathname.startsWith(`${t.href}/`);
        return (
          <Link
            key={t.href}
            href={t.href}
            prefetch
            className={`finance-subnav__tab ${active ? 'is-active' : ''}`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
