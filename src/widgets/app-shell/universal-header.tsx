'use client';

import {
  BulbOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  RightOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Dropdown } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fragment, memo, useMemo } from 'react';
import { useAuthStore } from '@app-init/store/auth-store';
import { useThemeStore } from '@app-init/store/theme-store';
import { usePageMetaStore } from '@app-init/store/page-meta-store';
import { NotificationCenter } from '@widgets/notifications/notification-center';

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
        className="uheader__sidebar-btn"
        aria-label={collapsed ? 'Развернуть сайдбар' : 'Свернуть сайдбар'}
      />

      <div className="uheader__breadcrumbs-wrap">
        <nav className="uheader__breadcrumbs" aria-label="Хлебные крошки">
          {(breadcrumbs?.length ? breadcrumbs : [{ label: title || 'Tom-Stroy CRM' }]).map(
            (c, i) => (
              <Fragment key={`${c.label}-${i}`}>
                {c.href ? (
                  <Link href={c.href} className="uheader__crumb">
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
        <NotificationCenter />
        <Button
          type="text"
          icon={<SettingOutlined />}
          onClick={() => router.push('/settings')}
          title="Настройки"
          aria-label="Настройки"
        />
        <Button
          type="text"
          icon={<BulbOutlined />}
          onClick={toggleTheme}
          title="Переключить тему"
        />
        <Dropdown menu={userMenu} trigger={['click']}>
          <div className="uheader__user">
            <Avatar size="small">{user?.fullName?.[0] ?? '?'}</Avatar>
            <span className="uheader__user-name">{user?.fullName ?? '—'}</span>
          </div>
        </Dropdown>
      </div>
    </header>
  );
}

export const UniversalHeader = memo(UniversalHeaderImpl);
