'use client';

import { Button, DatePicker, Form, Input, InputNumber, Segmented, Select } from 'antd';
import { message } from '@shared/lib/antd-static';
import dayjs, { Dayjs } from 'dayjs';
import { useCreateExpense } from '@entities/expense/hooks';
import type { ExpenseCategory, ExpenseScope } from '@entities/expense/types';
import { FormDirtyProbe } from '@shared/ui/form-dirty-probe';
import {
  EXPENSE_CATEGORY_OPTIONS as CATEGORIES,
  EXPENSE_SCOPE_LABEL,
} from '@shared/constants/expense-category';

const SCOPE_OPTIONS = (Object.keys(EXPENSE_SCOPE_LABEL) as ExpenseScope[]).map((v) => ({
  value: v,
  label: EXPENSE_SCOPE_LABEL[v],
}));

const ALLOCATION_KEYS = [
  { value: 'revenue', label: 'По выручке' },
  { value: 'area', label: 'По площади' },
  { value: 'headcount', label: 'По численности' },
];

interface FormShape {
  date: Dayjs;
  scope: ExpenseScope;
  category: ExpenseCategory;
  amount: number;
  projectId?: string;
  allocationKey?: string;
  comment?: string;
}

interface Props {
  /** Pre-fill projectId — useful when launched from a project detail page. */
  projectId?: string;
  onDone?: () => void;
  /** Notifies host (FormModal) about unsaved changes. */
  onDirtyChange?: (dirty: boolean) => void;
}

export function ExpenseForm({ projectId, onDone, onDirtyChange }: Props) {
  const [form] = Form.useForm<FormShape>();
  const mutation = useCreateExpense();
  const scope = Form.useWatch('scope', form);

  const onFinish = async (v: FormShape) => {
    try {
      await mutation.mutateAsync({
        date: v.date.toISOString(),
        scope: v.scope,
        category: v.category,
        amount: v.amount,
        projectId: v.scope === 'PROJECT' ? v.projectId || projectId : undefined,
        allocationKey: v.scope === 'ALLOCATED' ? v.allocationKey : undefined,
        comment: v.comment,
      });
      message.success('Расход добавлен');
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
      initialValues={{
        date: dayjs(),
        scope: projectId ? 'PROJECT' : 'COMPANY',
        category: 'OTHER',
      }}
    >
      {onDirtyChange && <FormDirtyProbe form={form} onChange={onDirtyChange} />}
      <Form.Item name="scope" label="Тип расхода" rules={[{ required: true }]}>
        <Segmented block options={SCOPE_OPTIONS} />
      </Form.Item>
      <Form.Item name="date" label="Дата" rules={[{ required: true }]}>
        <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
      </Form.Item>
      <Form.Item name="category" label="Категория" rules={[{ required: true }]}>
        <Select options={CATEGORIES} />
      </Form.Item>
      <Form.Item name="amount" label="Сумма" rules={[{ required: true }]}>
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>
      {scope === 'PROJECT' && !projectId && (
        <Form.Item
          name="projectId"
          label="ID объекта"
          rules={[{ required: true, message: 'Укажите объект для проектного расхода' }]}
        >
          <Input />
        </Form.Item>
      )}
      {scope === 'ALLOCATED' && (
        <Form.Item
          name="allocationKey"
          label="Ключ распределения"
          rules={[{ required: true }]}
          tooltip="Как разнести этот расход по объектам в отчётах"
        >
          <Select options={ALLOCATION_KEYS} />
        </Form.Item>
      )}
      <Form.Item name="comment" label="Комментарий">
        <Input.TextArea rows={3} />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={mutation.isPending} block>
        Сохранить
      </Button>
    </Form>
  );
}
