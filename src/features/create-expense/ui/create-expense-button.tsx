'use client';

import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
} from 'antd';
import { message } from '@shared/lib/antd-static';
import { PlusOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { useCreateExpense } from '@entities/expense/hooks';
import type { ExpenseCategory } from '@entities/expense/types';

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'MATERIALS', label: 'Материалы' },
  { value: 'SALARY', label: 'Зарплаты' },
  { value: 'EQUIPMENT', label: 'Техника' },
  { value: 'FUEL', label: 'Топливо' },
  { value: 'RENT', label: 'Аренда' },
  { value: 'TOOLS', label: 'Инструменты' },
  { value: 'TRANSPORT', label: 'Транспорт' },
  { value: 'TAXES', label: 'Налоги' },
  { value: 'OTHER', label: 'Прочее' },
];

interface FormShape {
  date: Dayjs;
  category: ExpenseCategory;
  amount: number;
  projectId?: string;
  comment?: string;
}

export function CreateExpenseButton({ projectId }: { projectId?: string } = {}) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<FormShape>();
  const mutation = useCreateExpense();

  const onFinish = async (v: FormShape) => {
    try {
      await mutation.mutateAsync({
        date: v.date.toISOString(),
        category: v.category,
        amount: v.amount,
        projectId: v.projectId || projectId,
        comment: v.comment,
      });
      message.success('Расход добавлен');
      form.resetFields();
      setOpen(false);
    } catch {
      message.error('Не удалось сохранить');
    }
  };

  return (
    <>
      <Button icon={<PlusOutlined />} onClick={() => setOpen(true)}>
        Расход
      </Button>
      <Drawer
        title="Новый расход"
        open={open}
        onClose={() => setOpen(false)}
        width={420}
        destroyOnClose
      >
        <Form<FormShape>
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ date: dayjs(), category: 'OTHER' }}
        >
          <Form.Item name="date" label="Дата" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
          <Form.Item name="category" label="Категория" rules={[{ required: true }]}>
            <Select options={CATEGORIES} />
          </Form.Item>
          <Form.Item name="amount" label="Сумма" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          {!projectId && (
            <Form.Item name="projectId" label="ID объекта (опционально)">
              <Input />
            </Form.Item>
          )}
          <Form.Item name="comment" label="Комментарий">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={mutation.isPending} block>
            Сохранить
          </Button>
        </Form>
      </Drawer>
    </>
  );
}
