'use client';

import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
} from 'antd';
import { message } from '@shared/lib/antd-static';
import { PlusOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { useCreateIncome } from '@entities/income/hooks';

interface FormShape {
  date: Dayjs;
  amount: number;
  projectId?: string;
  clientId?: string;
  comment?: string;
}

export function CreateIncomeButton({ projectId }: { projectId?: string } = {}) {
  const [open, setOpen] = useState(false);
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
      setOpen(false);
    } catch {
      message.error('Не удалось сохранить');
    }
  };

  return (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setOpen(true)}
      >
        Поступление
      </Button>
      <Drawer
        title="Новое поступление от клиента"
        open={open}
        onClose={() => setOpen(false)}
        width={420}
        destroyOnHidden
      >
        <Form<FormShape>
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ date: dayjs() }}
        >
          <Form.Item name="date" label="Дата" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} format="DD.MM.YYYY" />
          </Form.Item>
          <Form.Item name="amount" label="Сумма" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
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
          <Button
            type="primary"
            htmlType="submit"
            loading={mutation.isPending}
            block
          >
            Сохранить
          </Button>
        </Form>
      </Drawer>
    </>
  );
}
