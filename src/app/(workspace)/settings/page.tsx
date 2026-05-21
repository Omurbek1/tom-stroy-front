'use client';

import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Popconfirm,
  Radio,
  Skeleton,
  Space,
  Table,
  Tag,
} from 'antd';
import { message } from '@shared/lib/antd-static';
import { LogoutOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@shared/api/http';
import { apiRoutes } from '@shared/api/routes';
import type { ItemResponse } from '@shared/types/api';
import { PageHeader } from '@shared/ui/page-header';
import { useAuthStore } from '@app-init/store/auth-store';
import { useThemeStore } from '@app-init/store/theme-store';
import { formatDate } from '@shared/lib/format';

interface SessionRow {
  id: string;
  userAgent?: string | null;
  ip?: string | null;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
}

function useSessions() {
  return useQuery({
    queryKey: ['auth', 'sessions'],
    queryFn: async () => {
      const res = await http.get<ItemResponse<SessionRow[]>>(apiRoutes.auth.sessions);
      return res.data.data;
    },
  });
}

function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
      await http.post(apiRoutes.auth.changePassword, payload);
    },
  });
}

function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await http.delete(apiRoutes.auth.revokeSession(id));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth', 'sessions'] }),
  });
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirm: string;
}

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const themeMode = useThemeStore((s) => s.mode);
  const setTheme = useThemeStore((s) => s.set);

  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const changePassword = useChangePassword();
  const revokeSession = useRevokeSession();
  const [form] = Form.useForm<PasswordForm>();

  const sessionColumns: ColumnsType<SessionRow> = [
    {
      title: 'Устройство',
      dataIndex: 'userAgent',
      key: 'userAgent',
      render: (v) => v ?? '—',
    },
    { title: 'IP', dataIndex: 'ip', key: 'ip', width: 130, render: (v) => v ?? '—' },
    {
      title: 'Создана',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (v: string) => formatDate(v),
    },
    {
      title: 'Активность',
      dataIndex: 'lastUsedAt',
      key: 'lastUsedAt',
      width: 130,
      render: (v: string) => formatDate(v),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, r) => (
        <Popconfirm
          title="Завершить эту сессию?"
          okText="Завершить"
          cancelText="Отмена"
          onConfirm={() =>
            revokeSession.mutate(r.id, {
              onSuccess: () => message.success('Сессия завершена'),
            })
          }
        >
          <Button danger size="small" type="text" icon={<LogoutOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const onChangePassword = async (v: PasswordForm) => {
    if (v.newPassword !== v.confirm) {
      message.error('Пароли не совпадают');
      return;
    }
    try {
      await changePassword.mutateAsync({
        currentPassword: v.currentPassword,
        newPassword: v.newPassword,
      });
      message.success('Пароль изменён. Все сессии завершены — войдите заново.');
      form.resetFields();
    } catch (err: unknown) {
      const m = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      message.error(typeof m === 'string' ? m : 'Не удалось изменить пароль');
    }
  };

  return (
    <>
      <PageHeader title="Настройки" subtitle="Профиль, пароль, тема, активные сессии" />
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="Профиль">
          {user ? (
            <Descriptions column={{ xs: 1, sm: 2 }} size="small">
              <Descriptions.Item label="ФИО">{user.fullName}</Descriptions.Item>
              <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
              <Descriptions.Item label="Роль">
                <Tag>{user.role}</Tag>
              </Descriptions.Item>
              {user.employeeId && (
                <Descriptions.Item label="Сотрудник">{user.employeeId}</Descriptions.Item>
              )}
            </Descriptions>
          ) : (
            <Skeleton active />
          )}
        </Card>

        <Card title="Тема оформления">
          <Radio.Group
            value={themeMode}
            onChange={(e) => setTheme(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            options={[
              { value: 'light', label: 'Светлая' },
              { value: 'dark', label: 'Тёмная' },
            ]}
          />
        </Card>

        <Card title="Сменить пароль">
          <Form<PasswordForm>
            form={form}
            layout="vertical"
            onFinish={onChangePassword}
            style={{ maxWidth: 460 }}
          >
            <Form.Item
              name="currentPassword"
              label="Текущий пароль"
              rules={[{ required: true }]}
            >
              <Input.Password autoComplete="current-password" />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="Новый пароль"
              rules={[{ required: true, min: 8 }]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            <Form.Item
              name="confirm"
              label="Подтвердите новый пароль"
              rules={[{ required: true, min: 8 }]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={changePassword.isPending}>
              Сменить пароль
            </Button>
          </Form>
        </Card>

        <Card title="Активные сессии">
          <Table<SessionRow>
            rowKey="id"
            size="small"
            columns={sessionColumns}
            dataSource={sessions ?? []}
            loading={sessionsLoading}
            pagination={false}
            locale={{ emptyText: 'Нет активных сессий' }}
          />
        </Card>
      </Space>
    </>
  );
}
