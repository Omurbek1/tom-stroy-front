'use client';

import { Button, DatePicker, Form, Input, InputNumber, Select, Space } from 'antd';
import { message } from '@shared/lib/antd-static';
import dayjs, { Dayjs } from 'dayjs';
import { useRouter } from 'next/navigation';
import { useCreateProject } from '@entities/project/hooks';
import { FormDirtyProbe } from '@shared/ui/form-dirty-probe';

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

interface Props {
  /** Called after successful create. Use to close the host modal. */
  onDone?: () => void;
  /** If true — navigate to the new project's detail page on success. */
  redirectOnSuccess?: boolean;
  /** Called when the form's "touched" state flips. Enables host-side
   *  unsaved-changes guard. */
  onDirtyChange?: (dirty: boolean) => void;
}

/**
 * Standalone form for creating a project. Reused by both:
 *   - `<CreateProjectButton>` (page-local trigger)
 *   - `<CreateModalsHost>` (global FAB-driven drawer)
 */
export function ProjectForm({
  onDone,
  redirectOnSuccess = true,
  onDirtyChange,
}: Props) {
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
      onDone?.();
      if (redirectOnSuccess) router.push(`/projects/${created.id}`);
    } catch {
      message.error('Не удалось создать');
    }
  };

  return (
    <Form<FormShape>
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ planUnit: 'M3', range: [dayjs(), dayjs().add(30, 'day')] }}
    >
      {onDirtyChange && <FormDirtyProbe form={form} onChange={onDirtyChange} />}
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
  );
}
