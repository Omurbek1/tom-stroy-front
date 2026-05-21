'use client';

import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
} from 'antd';
import { message } from '@shared/lib/antd-static';
import { PlusOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateProject } from '@entities/project/hooks';

interface FormShape {
  name: string;
  address?: string;
  clientId?: string;
  range?: [Dayjs, Dayjs];
  budget?: number;
  planVolume?: number;
  planUnit?: string;
}

const UNIT_OPTIONS = [
  { value: 'M3', label: 'м³' },
  { value: 'M2', label: 'м²' },
  { value: 'M', label: 'пог. м' },
  { value: 'HOUR', label: 'час' },
  { value: 'SHIFT', label: 'смена' },
  { value: 'PIECE', label: 'шт' },
];

export function CreateProjectButton() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<FormShape>();
  const router = useRouter();
  const mutation = useCreateProject();

  const onFinish = async (v: FormShape) => {
    try {
      const created = await mutation.mutateAsync({
        name: v.name,
        address: v.address,
        clientId: v.clientId,
        startDate: v.range?.[0]?.toISOString(),
        deadline: v.range?.[1]?.toISOString(),
        budget: v.budget,
        planVolume: v.planVolume,
        planUnit: v.planUnit,
      });
      message.success('Объект создан');
      form.resetFields();
      setOpen(false);
      router.push(`/projects/${created.id}`);
    } catch {
      message.error('Не удалось создать');
    }
  };

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
        Новый объект
      </Button>
      <Drawer
        title="Новый объект"
        width={480}
        open={open}
        onClose={() => setOpen(false)}
        destroyOnHidden
      >
        <Form<FormShape>
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ planUnit: 'M3', range: [dayjs(), dayjs().add(30, 'day')] }}
        >
          <Form.Item name="name" label="Название" rules={[{ required: true }]}>
            <Input placeholder="ЖК Восход, корпус 3" />
          </Form.Item>
          <Form.Item name="address" label="Адрес">
            <Input placeholder="г. Бишкек, ул. ..." />
          </Form.Item>
          <Form.Item name="clientId" label="ID клиента (опционально)">
            <Input />
          </Form.Item>
          <Form.Item name="range" label="Сроки">
            <DatePicker.RangePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
          <Space.Compact style={{ width: '100%' }}>
            <Form.Item name="planVolume" label="Плановый объём" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="planUnit" label="Ед." style={{ width: 120 }}>
              <Select options={UNIT_OPTIONS} />
            </Form.Item>
          </Space.Compact>
          <Form.Item name="budget" label="Бюджет, ₽">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={mutation.isPending} block>
            Создать
          </Button>
        </Form>
      </Drawer>
    </>
  );
}
