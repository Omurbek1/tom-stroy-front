'use client';

import { Alert, Button, Divider, Form, Input, Typography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { message } from '@shared/lib/antd-static';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { login, LoginRequest } from '../api';
import { useAuthStore } from '@app-init/store/auth-store';

interface DemoAccount {
  email: string;
  password: string;
  label: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: 'owner@tomstroy.local', password: 'owner123!', label: 'Владелец' },
  { email: 'director@tomstroy.local', password: 'director123!', label: 'Директор' },
  { email: 'accountant@tomstroy.local', password: 'accountant123!', label: 'Бухгалтер' },
  { email: 'foreman@tomstroy.local', password: 'foreman123!', label: 'Прораб' },
];

export function LoginForm() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const [form] = Form.useForm<LoginRequest>();
  const [errorText, setErrorText] = useState<string | null>(null);

  // If we land on /login already authenticated (browser back, manual nav,
  // or "open new tab"), bounce to /dashboard instead of forcing re-login.
  useEffect(() => {
    if (hasHydrated && user) router.replace('/dashboard');
  }, [hasHydrated, user, router]);

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setSession(data.user, data.tokens);
      router.replace('/dashboard');
    },
    onError: (err: unknown) => {
      const detail =
        (err as { response?: { status?: number; data?: { detail?: string } } })?.response?.data
          ?.detail;
      const status = (err as { response?: { status?: number } })?.response?.status;
      const text =
        status === 401
          ? 'Неверный email или пароль'
          : status && status >= 500
            ? 'Сервер недоступен. Попробуйте позже.'
            : typeof detail === 'string'
              ? detail
              : 'Не удалось войти';
      setErrorText(text);
      message.error(text);
    },
  });

  const onFinish = (values: LoginRequest) => {
    setErrorText(null);
    mutation.mutate(values);
  };

  const fillDemo = (acc: DemoAccount) => {
    form.setFieldsValue({ email: acc.email, password: acc.password });
    setErrorText(null);
  };

  return (
    <div className="login-shell">
      <aside className="login-aside">
        <div>
          <Typography.Title level={2} style={{ color: 'white', marginBottom: 8 }}>
            Tom-Stroy CRM
          </Typography.Title>
          <Typography.Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>
            ERP для строительной компании: объекты, бригады, склад, финансы,
            зарплата и AI-аналитика — в одном окне.
          </Typography.Paragraph>
        </div>
        <ul className="login-features">
          <li>📋 Ежедневные отчёты прорабов с фото</li>
          <li>💰 P&amp;L и расчёт зарплат в реальном времени</li>
          <li>📦 Атомарные списания со склада</li>
          <li>🤖 Риски и рекомендации от Claude AI</li>
        </ul>
        <Typography.Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
          © Tom-Stroy. Все права защищены.
        </Typography.Text>
      </aside>

      <main className="login-main">
        <div className="login-card">
          <Typography.Title level={3} style={{ marginBottom: 4 }}>
            Вход в систему
          </Typography.Title>
          <Typography.Text type="secondary">
            Используйте корпоративный email и пароль
          </Typography.Text>

          {errorText && (
            <Alert
              type="error"
              showIcon
              message={errorText}
              style={{ marginTop: 16 }}
              closable
              onClose={() => setErrorText(null)}
            />
          )}

          <Form<LoginRequest>
            form={form}
            layout="vertical"
            style={{ marginTop: 16 }}
            onFinish={onFinish}
            requiredMark={false}
            initialValues={{ email: '', password: '' }}
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Введите email' },
                { type: 'email', message: 'Некорректный email' },
              ]}
            >
              <Input
                size="large"
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                autoComplete="email"
                autoFocus
                placeholder="you@tomstroy.local"
              />
            </Form.Item>
            <Form.Item
              label="Пароль"
              name="password"
              rules={[
                { required: true, message: 'Введите пароль' },
                { min: 6, message: 'Минимум 6 символов' },
              ]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                autoComplete="current-password"
              />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={mutation.isPending}
            >
              Войти
            </Button>
          </Form>

          <Divider plain style={{ color: '#999', fontSize: 12 }}>
            Демо-доступы
          </Divider>
          <div className="login-demo-grid">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                className="login-demo-chip"
                onClick={() => fillDemo(acc)}
              >
                <strong>{acc.label}</strong>
                <span>{acc.email}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
