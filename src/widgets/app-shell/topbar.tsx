'use client';

import { BulbOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { memo, useMemo } from 'react';
import { useAuthStore } from '@app-init/store/auth-store';
import { useThemeStore } from '@app-init/store/theme-store';
import { NotificationCenter } from '@widgets/notifications/notification-center';

interface Props {
  onToggleMobileNav: () => void;
}

function TopbarImpl({ onToggleMobileNav }: Props) {
  const router = useRouter();
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
    <header className="app-topbar">
      <Button
        type="text"
        icon={<MenuOutlined />}
        onClick={onToggleMobileNav}
        className="app-topbar__menu-btn"
        aria-label="Открыть меню"
      />
      <div className="app-topbar__spacer" />
      <NotificationCenter />
      <Button
        type="text"
        icon={<BulbOutlined />}
        onClick={toggleTheme}
        title="Переключить тему"
      />
      <Dropdown menu={userMenu} trigger={['click']}>
        <div className="app-topbar__user">
          <Avatar size="small">{user?.fullName?.[0] ?? '?'}</Avatar>
          <Typography.Text className="app-topbar__user-name">
            {user?.fullName ?? '—'}
          </Typography.Text>
        </div>
      </Dropdown>
    </header>
  );
}

export const Topbar = memo(TopbarImpl);
