'use client';

import { Button, Drawer, Form, Input, InputNumber, Select, Typography } from 'antd';
import { message } from '@shared/lib/antd-static';
import { useEffect } from 'react';
import { useAddLine } from '@entities/payroll/hooks';
import type { Payroll, PayrollLineKind } from '@entities/payroll/types';
import { formatMoney } from '@shared/lib/format';

const KIND_OPTIONS: { value: PayrollLineKind; label: string }[] = [
  { value: 'advance', label: 'Аванс' },
  { value: 'fine', label: 'Штраф' },
  { value: 'bonus', label: 'Премия' },
  { value: 'deduction', label: 'Удержание' },
];

interface FormShape {
  kind: PayrollLineKind;
  amount: number;
  note?: string;
}

export function PayrollLineDrawer({
  payroll,
  open,
  onClose,
}: {
  payroll: Payroll | null;
  open: boolean;
  onClose: () => void;
}) {
  const [form] = Form.useForm<FormShape>();
  const mutation = useAddLine(payroll?.id ?? '');

  useEffect(() => {
    if (open) form.resetFields();
  }, [open, form]);

  const onFinish = async (v: FormShape) => {
    if (!payroll) return;
    try {
      await mutation.mutateAsync(v);
      message.success('Сохранено');
      onClose();
    } catch {
      message.error('Не удалось сохранить');
    }
  };

  return (
    <Drawer
      title={payroll ? `Корректировка: ${payroll.employee?.fullName ?? ''}` : 'Корректировка'}
      open={open}
      onClose={onClose}
      width={420}
      destroyOnHidden
    >
      {payroll && (
        <Typography.Paragraph type="secondary">
          Начислено: {formatMoney(payroll.accrued)} · уже: аванс {formatMoney(payroll.advance)},
          штраф {formatMoney(payroll.fines)}, премия {formatMoney(payroll.bonus)}
        </Typography.Paragraph>
      )}
      <Form<FormShape>
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ kind: 'advance' }}
      >
        <Form.Item name="kind" label="Тип" rules={[{ required: true }]}>
          <Select options={KIND_OPTIONS} />
        </Form.Item>
        <Form.Item name="amount" label="Сумма" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="note" label="Комментарий">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={mutation.isPending} block>
          Сохранить
        </Button>
      </Form>
    </Drawer>
  );
}
