'use client';

import { Button, Col, DatePicker, Form, Input, InputNumber, Row, Segmented, Select } from 'antd';
import { message } from '@shared/lib/antd-static';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect } from 'react';
import { useCreateExpense, useUpdateExpense } from '@entities/expense/hooks';
import type { Expense, ExpenseCategory, ExpenseScope } from '@entities/expense/types';
import { FormDirtyProbe } from '@shared/ui/form-dirty-probe';
import { ProjectSelect } from '@shared/ui/project-select';
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
  /** Edit mode: when present, form pre-fills and patches instead of creating. */
  expense?: Expense | null;
  onDone?: () => void;
  /** Notifies host (FormModal) about unsaved changes. */
  onDirtyChange?: (dirty: boolean) => void;
}

export function ExpenseForm({ projectId, expense, onDone, onDirtyChange }: Props) {
  const [form] = Form.useForm<FormShape>();
  const create = useCreateExpense();
  const update = useUpdateExpense();
  const isEdit = Boolean(expense);
  const scope = Form.useWatch('scope', form);

  useEffect(() => {
    if (expense) {
      form.setFieldsValue({
        date: dayjs(expense.date),
        scope: expense.scope,
        category: expense.category,
        amount: Number(expense.amount),
        projectId: expense.projectId ?? undefined,
        allocationKey: expense.allocationKey ?? undefined,
        comment: expense.comment ?? undefined,
      });
    }
  }, [expense, form]);

  const onFinish = async (v: FormShape) => {
    try {
      const payload = {
        date: v.date.toISOString(),
        scope: v.scope,
        category: v.category,
        amount: v.amount,
        projectId: v.scope === 'PROJECT' ? v.projectId || projectId : undefined,
        allocationKey: v.scope === 'ALLOCATED' ? v.allocationKey : undefined,
        comment: v.comment,
      };
      if (isEdit && expense) {
        await update.mutateAsync({ id: expense.id, payload });
        message.success('Сохранено');
      } else {
        await create.mutateAsync(payload);
        message.success('Расход добавлен');
        form.resetFields();
      }
      onDone?.();
    } catch {
      message.error('Не удалось сохранить');
    }
  };

  const pending = create.isPending || update.isPending;

  return (
    <Form<FormShape>
      form={form}
      layout="vertical"
      size="large"
      requiredMark="optional"
      onFinish={onFinish}
      initialValues={
        isEdit
          ? undefined
          : {
              date: dayjs(),
              scope: projectId ? 'PROJECT' : 'COMPANY',
              category: 'OTHER',
            }
      }
      style={{ padding: '20px 28px' }}
    >
      {onDirtyChange && <FormDirtyProbe form={form} onChange={onDirtyChange} />}

      <Form.Item name="scope" label="Тип расхода" rules={[{ required: true }]}>
        <Segmented block options={SCOPE_OPTIONS} size="large" />
      </Form.Item>

      <Row gutter={20}>
        <Col span={12}>
          <Form.Item name="date" label="Дата" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="amount" label="Сумма" rules={[{ required: true, message: 'Введите сумму' }]}>
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
              parser={(v) => Number(`${v}`.replace(/\s/g, '')) as 0}
              addonAfter="сом"
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="category" label="Категория" rules={[{ required: true }]}>
            <Select options={CATEGORIES} showSearch optionFilterProp="label" />
          </Form.Item>
        </Col>
        {scope === 'PROJECT' && !projectId && (
          <Col span={24}>
            <Form.Item
              name="projectId"
              label="Объект"
              rules={[{ required: true, message: 'Укажите объект для проектного расхода' }]}
            >
              <ProjectSelect />
            </Form.Item>
          </Col>
        )}
        {scope === 'ALLOCATED' && (
          <Col span={24}>
            <Form.Item
              name="allocationKey"
              label="Ключ распределения"
              rules={[{ required: true }]}
              tooltip="Как разнести этот расход по объектам в отчётах"
            >
              <Select options={ALLOCATION_KEYS} />
            </Form.Item>
          </Col>
        )}
        <Col span={24}>
          <Form.Item name="comment" label="Комментарий">
            <Input.TextArea
              rows={3}
              placeholder="Опишите расход подробнее — увидят бухгалтер и собственник"
            />
          </Form.Item>
        </Col>
      </Row>

      <Button type="primary" htmlType="submit" loading={pending} block size="large">
        {isEdit ? 'Сохранить' : 'Добавить расход'}
      </Button>
    </Form>
  );
}
