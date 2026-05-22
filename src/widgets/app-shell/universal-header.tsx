'use client';

import {
  AppstoreOutlined,
  BulbOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  RightOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Dropdown } from 'antd';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fragment, memo, useMemo } from 'react';
import { useAuthStore } from '@app-init/store/auth-store';
import { useThemeStore } from '@app-init/store/theme-store';
import { usePageMetaStore } from '@app-init/store/page-meta-store';
import { useObjectSwitcher } from '@widgets/object-switcher/use-object-switcher';

// Both NotificationCenter and ObjectSwitcher are only seen when the
// user clicks the bell / ⌘P respectively. Lazy-splitting saves ~30-50KB
// off every workspace page's First Load JS — including the
// `useNotifications` and `useProjectsList` queries they fire on mount.
const NotificationCenter = dynamic(
  () =>
    import('@widgets/notifications/notification-center').then((m) => ({
      default: m.NotificationCenter,
    })),
  { ssr: false, loading: () => <span style={{ width: 32, height: 32 }} /> },
);
const ObjectSwitcher = dynamic(
  () =>
    import('@widgets/object-switcher/object-switcher').then((m) => ({
      default: m.ObjectSwitcher,
    })),
  { ssr: false },
);

interface Props {
  collapsed: boolean;
  onToggleSidebar: () => void;
  onToggleMobileNav: () => void;
}

/**
 * Compact global header for the entire workspace:
 *
 *   [sidebar toggle] [breadcrumbs] · [bell] [settings] [theme] [user]
 *
 * Page search, filters, tabs, stats and create actions intentionally
 * live below this component in PageHeader/PageToolbar.
 *
 * Wrapped in React.memo: the parent (AppShell) only re-renders when
 * sidebar-collapsed state flips.
 */
function UniversalHeaderImpl({ collapsed, onToggleSidebar, onToggleMobileNav }: Props) {
  const router = useRouter();

  const title = usePageMetaStore((s) => s.title);
  const breadcrumbs = usePageMetaStore((s) => s.breadcrumbs);

  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const toggleTheme = useThemeStore((s) => s.toggle);

  const switcher = useObjectSwitcher();

  const userMenu = useMemo(
    () => ({
      items: [
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Выйти',
          onClick: () => {
            clear();
            router.replace('/login');
          },
        },
      ],
    }),
    [clear, router],
  );

  return (
    <header className="uheader">
      <Button
        type="text"
        icon={<MenuOutlined />}
        onClick={onToggleMobileNav}
        className="uheader__menu-btn"
        aria-label="Открыть меню"
      />
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggleSidebar}
        className="uheader__sidebar-btn uheader__action-desktop-only"
        aria-label={collapsed ? 'Развернуть сайдбар' : 'Свернуть сайдбар'}
      />

      <div className="uheader__breadcrumbs-wrap">
        <nav className="uheader__breadcrumbs" aria-label="Хлебные крошки">
          {(breadcrumbs?.length ? breadcrumbs : [{ label: title || 'Tom-Stroy CRM' }]).map(
            (c, i) => (
              <Fragment key={`${c.label}-${i}`}>
                {c.href ? (
                  <Link href={c.href} className="uheader__crumb" prefetch>
                    {c.label}
                  </Link>
                ) : (
                  <span className="uheader__crumb">{c.label}</span>
                )}
                <RightOutlined className="uheader__crumb-sep" />
              </Fragment>
            ),
          )}
        </nav>
      </div>

      <div className="uheader__actions">
        <Button
          type="text"
          icon={<AppstoreOutlined />}
          onClick={switcher.openSwitcher}
          title="Переключатель объектов (⌘P)"
          aria-label="Объекты"
        />
        <NotificationCenter />
        <Button
          type="text"
          icon={<SettingOutlined />}
          onClick={() => router.push('/settings')}
          title="Настройки"
          aria-label="Настройки"
          className="uheader__action-desktop-only"
        />
        <Button
          type="text"
          icon={<BulbOutlined />}
          onClick={toggleTheme}
          title="Переключить тему"
          className="uheader__action-desktop-only"
        />
        <Dropdown menu={userMenu} trigger={['click']}>
          <div className="uheader__user">
            <Avatar size="small">{user?.fullName?.[0] ?? '?'}</Avatar>
            <span className="uheader__user-name">{user?.fullName ?? '—'}</span>
          </div>
        </Dropdown>
      </div>

      <ObjectSwitcher open={switcher.open} onClose={switcher.closeSwitcher} />
    </header>
  );
}

export const UniversalHeader = memo(UniversalHeaderImpl);
