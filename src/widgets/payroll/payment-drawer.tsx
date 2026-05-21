'use client';

import { Button, Form, InputNumber, Select, Typography } from 'antd';
import { FormModal } from '@shared/ui/form-modal';
import { useFormDirty } from '@shared/hooks/use-form-dirty';
import { message } from '@shared/lib/antd-static';
import { useEffect } from 'react';
import { useAddPayment } from '@entities/payroll/hooks';
import type { Payroll, PaymentMethod } from '@entities/payroll/types';
import { formatMoney } from '@shared/lib/format';

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Наличные' },
  { value: 'bank', label: 'Банк' },
  { value: 'card', label: 'Карта' },
];

interface FormShape {
  amount: number;
  method?: PaymentMethod;
}

function netToPay(p: Payroll): number {
  return (
    Number(p.accrued) -
    Number(p.advance) -
    Number(p.fines) +
    Number(p.bonus) -
    Number(p.deductions)
  );
}

export function PaymentDrawer({
  payroll,
  open,
  onClose,
}: {
  payroll: Payroll | null;
  open: boolean;
  onClose: () => void;
}) {
  const [form] = Form.useForm<FormShape>();
  const mutation = useAddPayment(payroll?.id ?? '');
  const dirty = useFormDirty(form);

  useEffect(() => {
    if (open && payroll) {
      const remaining = Math.max(0, netToPay(payroll) - Number(payroll.paid));
      form.setFieldsValue({ amount: remaining, method: 'cash' });
    }
  }, [open, payroll, form]);

  const onFinish = async (v: FormShape) => {
    if (!payroll) return;
    try {
      await mutation.mutateAsync(v);
      message.success('Выплата зафиксирована');
      onClose();
    } catch {
      message.error('Не удалось сохранить');
    }
  };

  return (
    <FormModal
      title={payroll ? `Выплата: ${payroll.employee?.fullName ?? ''}` : 'Выплата'}
      open={open}
      onClose={onClose}
      width={460}
      dirty={dirty}
      onSubmit={() => form.submit()}
    >
      {payroll && (
        <Typography.Paragraph type="secondary">
          К выплате: <strong>{formatMoney(netToPay(payroll))}</strong> ·
          уже выплачено: {formatMoney(payroll.paid)}
        </Typography.Paragraph>
      )}
      <Form<FormShape> form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="amount" label="Сумма" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="method" label="Способ">
          <Select options={METHODS} />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={mutation.isPending} block>
          Выплатить
        </Button>
      </Form>
    </FormModal>
  );
}
