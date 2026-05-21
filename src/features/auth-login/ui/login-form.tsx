'use client';

import { Button, Card, Form, Input, Typography } from 'antd';
import { message } from '@shared/lib/antd-static';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { login, LoginRequest } from '../api';
import { useAuthStore } from '@app-init/store/auth-store';

export function LoginForm() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setSession(data.user, data.tokens);
      router.replace('/dashboard');
    },
    onError: () => {
      message.error('Неверный email или пароль');
    },
  });

  const onFinish = (values: LoginRequest) => mutation.mutate(values);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <Card style={{ width: 420 }}>
        <Typography.Title level={3} style={{ marginBottom: 4 }}>
          Tom-Stroy CRM
        </Typography.Title>
        <Typography.Text type="secondary">Вход в систему</Typography.Text>
        <Form layout="vertical" className="mt-4" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input autoComplete="email" placeholder="owner@tomstroy.local" />
          </Form.Item>
          <Form.Item
            label="Пароль"
            name="password"
            rules={[{ required: true, min: 6 }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={mutation.isPending}
          >
            Войти
          </Button>
        </Form>
      </Card>
    </div>
  );
}
