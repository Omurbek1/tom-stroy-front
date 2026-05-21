'use client';

import { Button, DatePicker, Form, Input, InputNumber } from 'antd';
import { message } from '@shared/lib/antd-static';
import dayjs, { Dayjs } from 'dayjs';
import { useCreateIncome } from '@entities/income/hooks';
import { FormDirtyProbe } from '@shared/ui/form-dirty-probe';

interface FormShape {
  date: Dayjs;
  amount: number;
  projectId?: string;
  clientId?: string;
  comment?: string;
}

interface Props {
  projectId?: string;
  onDone?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export function IncomeForm({ projectId, onDone, onDirtyChange }: Props) {
  const [form] = Form.useForm<FormShape>();
  const mutation = useCreateIncome();

  const onFinish = async (v: FormShape) => {
    try {
      await mutation.mutateAsync({
        date: v.date.toISOString(),
        amount: v.amount,
        projectId: v.projectId || projectId,
        clientId: v.clientId,
        comment: v.comment,
      });
      message.success('Доход добавлен');
      form.resetFields();
      onDone?.();
    } catch {
      message.error('Не удалось сохранить');
    }
  };

  return (
    <Form<FormShape>
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ date: dayjs() }}
    >
      {onDirtyChange && <FormDirtyProbe form={form} onChange={onDirtyChange} />}
      <Form.Item name="date" label="Дата" rules={[{ required: true }]}>
        <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
      </Form.Item>
      <Form.Item name="amount" label="Сумма" rules={[{ required: true }]}>
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>
      {!projectId && (
        <Form.Item name="projectId" label="ID объекта (опционально)">
          <Input />
        </Form.Item>
      )}
      <Form.Item name="clientId" label="ID клиента (опционально)">
        <Input />
      </Form.Item>
      <Form.Item name="comment" label="Комментарий">
        <Input.TextArea rows={3} />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={mutation.isPending} block>
        Сохранить
      </Button>
    </Form>
  );
}
