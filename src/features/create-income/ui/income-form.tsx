'use client';

import { Button, Col, DatePicker, Form, Input, InputNumber, Row } from 'antd';
import { message } from '@shared/lib/antd-static';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect } from 'react';
import { useCreateIncome, useUpdateIncome } from '@entities/income/hooks';
import type { Income } from '@entities/income/types';
import { FormDirtyProbe } from '@shared/ui/form-dirty-probe';
import { ProjectSelect } from '@shared/ui/project-select';

interface FormShape {
  date: Dayjs;
  amount: number;
  projectId?: string;
  clientId?: string;
  comment?: string;
}

interface Props {
  projectId?: string;
  income?: Income | null;
  onDone?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export function IncomeForm({ projectId, income, onDone, onDirtyChange }: Props) {
  const [form] = Form.useForm<FormShape>();
  const create = useCreateIncome();
  const update = useUpdateIncome();
  const isEdit = Boolean(income);

  useEffect(() => {
    if (income) {
      form.setFieldsValue({
        date: dayjs(income.date),
        amount: Number(income.amount),
        projectId: income.projectId ?? undefined,
        clientId: income.clientId ?? undefined,
        comment: income.comment ?? undefined,
      });
    }
  }, [income, form]);

  const onFinish = async (v: FormShape) => {
    try {
      const payload = {
        date: v.date.toISOString(),
        amount: v.amount,
        projectId: v.projectId || projectId,
        clientId: v.clientId,
        comment: v.comment,
      };
      if (isEdit && income) {
        await update.mutateAsync({ id: income.id, payload });
        message.success('Сохранено');
      } else {
        await create.mutateAsync(payload);
        message.success('Поступление добавлено');
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
      initialValues={isEdit ? undefined : { date: dayjs() }}
      style={{ padding: '20px 28px' }}
    >
      {onDirtyChange && <FormDirtyProbe form={form} onChange={onDirtyChange} />}

      <Row gutter={20}>
        <Col span={12}>
          <Form.Item name="date" label="Дата поступления" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="amount"
            label="Сумма"
            rules={[{ required: true, message: 'Введите сумму' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
              parser={(v) => Number(`${v}`.replace(/\s/g, '')) as 0}
              addonAfter="сом"
            />
          </Form.Item>
        </Col>
        {!projectId && (
          <Col span={24}>
            <Form.Item name="projectId" label="Объект" tooltip="К какому объекту относится поступление">
              <ProjectSelect />
            </Form.Item>
          </Col>
        )}
        <Col span={24}>
          <Form.Item
            name="comment"
            label="Назначение платежа"
            tooltip="Что именно оплачено: аванс / промежуточный платёж / финальный расчёт"
          >
            <Input.TextArea
              rows={3}
              placeholder="Например: аванс по договору №42 от 12.03.2026"
            />
          </Form.Item>
        </Col>
      </Row>

      <Button type="primary" htmlType="submit" loading={pending} block size="large">
        {isEdit ? 'Сохранить' : 'Добавить поступление'}
      </Button>
    </Form>
  );
}
