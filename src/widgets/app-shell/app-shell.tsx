'use client';

import {
  DashboardOutlined,
  ProjectOutlined,
  TeamOutlined,
  UserOutlined,
  ShopOutlined,
  DollarOutlined,
  WalletOutlined,
  BarChartOutlined,
  CarOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Avatar, Dropdown, Typography, Button } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useMemo } from 'react';
import { useAuthStore } from '@app-init/store/auth-store';
import { useThemeStore } from '@app-init/store/theme-store';
import { NotificationCenter } from '@widgets/notifications/notification-center';

const { Sider, Header, Content } = Layout;

const NAV: { key: string; href: string; label: string; icon: ReactNode }[] = [
  { key: 'dashboard', href: '/dashboard', label: 'Дашборд', icon: <DashboardOutlined /> },
  { key: 'projects', href: '/projects', label: 'Объекты', icon: <ProjectOutlined /> },
  { key: 'brigades', href: '/brigades', label: 'Бригады', icon: <TeamOutlined /> },
  { key: 'employees', href: '/employees', label: 'Сотрудники', icon: <UserOutlined /> },
  { key: 'warehouse', href: '/warehouse', label: 'Склад', icon: <ShopOutlined /> },
  { key: 'finance', href: '/finance', label: 'Финансы', icon: <DollarOutlined /> },
  { key: 'payroll', href: '/payroll', label: 'Зарплаты', icon: <WalletOutlined /> },
  { key: 'analytics', href: '/analytics', label: 'Аналитика', icon: <BarChartOutlined /> },
  { key: 'vehicles', href: '/vehicles', label: 'Техника', icon: <CarOutlined /> },
  { key: 'reports', href: '/reports', label: 'Отчёты', icon: <FileTextOutlined /> },
  { key: 'settings', href: '/settings', label: 'Настройки', icon: <SettingOutlined /> },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const themeMode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!user) router.replace('/login');
  }, [user, router]);

  const selectedKey = useMemo(() => {
    const seg = pathname.split('/')[1] || 'dashboard';
    return seg;
  }, [pathname]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme={themeMode === 'dark' ? 'dark' : 'light'} width={220}>
        <div className="px-4 py-4 font-semibold" style={{ fontSize: 16 }}>
          🏗 Tom-Stroy
        </div>
        <Menu
          theme={themeMode === 'dark' ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={[selectedKey]}
          items={NAV.map((n) => ({
            key: n.key,
            icon: n.icon,
            label: <Link href={n.href}>{n.label}</Link>,
          }))}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: themeMode === 'dark' ? '#141414' : '#fff',
            padding: '0 16px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <NotificationCenter />
          <Button
            type="text"
            icon={<BulbOutlined />}
            onClick={toggleTheme}
            title="Переключить тему"
          />
          <Dropdown
            menu={{
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
            }}
          >
            <div className="cursor-pointer flex items-center gap-2">
              <Avatar size="small">{user?.fullName?.[0] ?? '?'}</Avatar>
              <Typography.Text>{user?.fullName ?? '—'}</Typography.Text>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ padding: 24, overflow: 'auto' }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
