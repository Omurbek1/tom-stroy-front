'use client';

import { useMemo, useState } from 'react';
import { Button, DatePicker, Form, Input, InputNumber, Select } from 'antd';
import { BankOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { message } from '@shared/lib/antd-static';
import { FormModal } from '@shared/ui/form-modal';
import { useFormDirty } from '@shared/hooks/use-form-dirty';
import { useCreateExpense } from '@entities/expense/hooks';
import { useFinanceOperations } from '@entities/finance/hooks';
import type { ExpenseCategory } from '@entities/expense/types';

interface FormShape {
  date: Dayjs;
  counterparty: string;
  category: ExpenseCategory;
  amount: number;
  method: 'cash' | 'bank' | 'card';
  note?: string;
}

const METHOD_OPTIONS = [
  { value: 'cash', label: 'Наличными' },
  { value: 'bank', label: 'На счёт' },
  { value: 'card', label: 'Картой' },
];

const CATEGORY_BY_TYPE: Record<string, ExpenseCategory> = {
  supplier: 'MATERIALS',
  employee: 'SALARY',
};

interface Props {
  projectId: string;
  from: string;
  to: string;
}

/**
 * Quick action: «Погасить долг». Создаёт Expense на сумму погашения,
 * автоматически проставляя категорию по типу долга (поставщик→MATERIALS,
 * сотрудник→SALARY). Список контрагентов берётся из открытых payables.
 */
export function RegisterDebtPaymentButton({ projectId, from, to }: Props) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<FormShape>();
  const dirty = useFormDirty(form);
  const create = useCreateExpense();
  const { data } = useFinanceOperations({ from, to, projectId });

  const counterpartyOptions = useMemo(() => {
    const list = data?.payables ?? [];
    return list.map((row) => ({
      value: `${row.type}::${row.counterparty}`,
      label: `${row.counterparty} — ${row.amount.toLocaleString('ru-RU')} сом`,
      type: row.type,
      counterparty: row.counterparty,
    }));
  }, [data]);

  const onFinish = async (v: FormShape) => {
    const [type, name] = v.counterparty.split('::');
    const methodLabel =
      METHOD_OPTIONS.find((o) => o.value === v.method)?.label.toLowerCase() ?? v.method;
    try {
      await create.mutateAsync({
        date: v.date.toISOString(),
        scope: 'PROJECT',
        projectId,
        category: v.category,
        amount: v.amount,
        comment: `Погашение долга: ${name} (${methodLabel})${v.note ? '. ' + v.note : ''}`,
      });
      message.success(`Платёж зафиксирован: ${name}`);
      form.resetFields();
      setOpen(false);
    } catch {
      message.error('Не удалось сохранить платёж');
    }
  };

  return (
    <>
      <Button icon={<BankOutlined />} onClick={() => setOpen(true)}>
        Погасить долг
      </Button>
      <FormModal
        title="Погашение долга"
        subtitle="Фиксируется как расход объекта и снижает задолженность перед контрагентом"
        open={open}
        onClose={() => setOpen(false)}
        width={640}
        dirty={dirty}
        onSubmit={() => form.submit()}
        footer={
          <Button
            type="primary"
            size="large"
            block
            loading={create.isPending}
            onClick={() => form.submit()}
          >
            Зафиксировать платёж
          </Button>
        }
      >
        <Form<FormShape>
          form={form}
          layout="vertical"
          size="large"
          requiredMark="optional"
          onFinish={onFinish}
          initialValues={{ date: dayjs(), method: 'cash', category: 'MATERIALS' }}
          style={{ padding: '20px 28px' }}
        >
          <Form.Item
            name="counterparty"
            label="Кому платим"
            rules={[{ required: true, message: 'Выберите контрагента' }]}
            tooltip="Список ограничен текущими открытыми долгами по объекту"
          >
            <Select
              showSearch
              placeholder={
                counterpartyOptions.length === 0
                  ? 'Открытых долгов по объекту нет'
                  : 'Поставщик или сотрудник'
              }
              optionFilterProp="label"
              options={counterpartyOptions}
              disabled={counterpartyOptions.length === 0}
              onChange={(value) => {
                const opt = counterpartyOptions.find((o) => o.value === value);
                if (opt) {
                  form.setFieldValue('category', CATEGORY_BY_TYPE[opt.type] ?? 'OTHER');
                }
              }}
            />
          </Form.Item>
          <Form.Item name="date" label="Дата платежа" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
          <Form.Item name="amount" label="Сумма" rules={[{ required: true, message: 'Введите сумму' }]}>
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
              parser={(v) => Number(`${v}`.replace(/\s/g, '')) as 1}
              addonAfter="сом"
            />
          </Form.Item>
          <Form.Item name="method" label="Способ" rules={[{ required: true }]}>
            <Select options={METHOD_OPTIONS} />
          </Form.Item>
          <Form.Item name="note" label="Примечание">
            <Input.TextArea rows={2} placeholder="Номер договора / частичный платёж" />
          </Form.Item>
        </Form>
      </FormModal>
    </>
  );
}
