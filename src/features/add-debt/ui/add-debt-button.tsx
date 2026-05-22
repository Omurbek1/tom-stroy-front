'use client';

import { useEffect, useState } from 'react';
import { Button, Col, DatePicker, Form, Input, InputNumber, Row, Segmented } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { message } from '@shared/lib/antd-static';
import { FormModal } from '@shared/ui/form-modal';
import { useFormDirty } from '@shared/hooks/use-form-dirty';
import { useCreateDebt, useUpdateDebt } from '@entities/debt/hooks';
import type { Debt, DebtKind } from '@entities/debt/types';

interface FormShape {
  kind: DebtKind;
  counterparty: string;
  amount: number;
  dueDate?: Dayjs;
  note?: string;
}

const KIND_OPTIONS = [
  { value: 'PAYABLE', label: 'Мы должны' },
  { value: 'RECEIVABLE', label: 'Нам должны' },
];

interface Props {
  /** Если задан — долг создаётся с привязкой к объекту. */
  projectId?: string;
  /** Дефолтный kind. */
  defaultKind?: DebtKind;
  /** Edit mode. */
  debt?: Debt | null;
  /** Controlled mode. */
  open?: boolean;
  onClose?: () => void;
  hideTrigger?: boolean;
}

export function AddDebtButton({
  projectId,
  defaultKind = 'PAYABLE',
  debt,
  open: openProp,
  onClose,
  hideTrigger,
}: Props = {}) {
  const [openState, setOpenState] = useState(false);
  const controlled = openProp !== undefined;
  const open = controlled ? !!openProp : openState;
  const close = () => {
    if (controlled) onClose?.();
    else setOpenState(false);
  };

  const [form] = Form.useForm<FormShape>();
  const dirty = useFormDirty(form);
  const create = useCreateDebt();
  const update = useUpdateDebt();
  const isEdit = Boolean(debt);
  const kind = Form.useWatch('kind', form) ?? (debt?.kind ?? defaultKind);
  const isPayable = kind === 'PAYABLE';

  useEffect(() => {
    if (debt) {
      form.setFieldsValue({
        kind: debt.kind,
        counterparty: debt.counterparty,
        amount: Number(debt.amount),
        dueDate: debt.dueDate ? dayjs(debt.dueDate) : undefined,
        note: debt.note ?? undefined,
      });
    } else if (open && !controlled) {
      form.resetFields();
      form.setFieldsValue({ kind: defaultKind });
    }
  }, [debt, open, defaultKind, controlled, form]);

  const onFinish = async (v: FormShape) => {
    const payload = {
      kind: v.kind,
      counterparty: v.counterparty.trim(),
      projectId,
      amount: v.amount,
      dueDate: v.dueDate?.toISOString(),
      note: v.note?.trim() || undefined,
    };
    try {
      if (isEdit && debt) {
        await update.mutateAsync({ id: debt.id, payload });
        message.success('Изменения сохранены');
      } else {
        await create.mutateAsync(payload);
        message.success('Долг добавлен');
        form.resetFields();
      }
      close();
    } catch {
      message.error('Не удалось сохранить');
    }
  };

  return (
    <>
      {!hideTrigger && !controlled && (
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpenState(true)}>
          Добавить долг
        </Button>
      )}
      <FormModal
        title={isEdit ? 'Редактирование долга' : 'Новый долг'}
        subtitle={
          isEdit
            ? 'Изменения попадут в P&L и долговую ленту'
            : 'Долг с собственным реестром платежей: займ, неоформленный договор, рассрочка'
        }
        open={open}
        onClose={close}
        width={720}
        dirty={dirty}
        onSubmit={() => form.submit()}
        footer={
          <Button
            type="primary"
            size="large"
            block
            loading={create.isPending || update.isPending}
            onClick={() => form.submit()}
          >
            {isEdit ? 'Сохранить' : 'Добавить долг'}
          </Button>
        }
      >
        <Form<FormShape>
          form={form}
          layout="vertical"
          size="large"
          requiredMark="optional"
          onFinish={onFinish}
          initialValues={isEdit ? undefined : { kind: defaultKind }}
          style={{ padding: '20px 28px' }}
        >
          <Form.Item name="kind" label="Тип задолженности" rules={[{ required: true }]}>
            <Segmented block size="large" options={KIND_OPTIONS} />
          </Form.Item>
          <Form.Item
            name="counterparty"
            label={isPayable ? 'Кому мы должны' : 'Кто нам должен'}
            rules={[
              {
                required: true,
                message: isPayable
                  ? 'Укажите получателя — поставщика, сотрудника, банк'
                  : 'Укажите плательщика — клиента, заказчика, контрагента',
              },
            ]}
            tooltip={
              isPayable
                ? 'Кому мы должны заплатить: ФИО, организация, банк'
                : 'Кто должен нам заплатить: клиент, заказчик, организация'
            }
          >
            <Input
              placeholder={
                isPayable
                  ? 'Поставщик / банк / ФИО сотрудника'
                  : 'Клиент / заказчик / ФИО плательщика'
              }
            />
          </Form.Item>
          <Row gutter={20}>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="Сумма"
                rules={[{ required: true, message: 'Введите сумму' }]}
              >
                <InputNumber
                  min={0.01}
                  style={{ width: '100%' }}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                  parser={(v) => Number(`${v}`.replace(/\s/g, '')) as 0.01}
                  addonAfter="сом"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dueDate"
                label="Срок погашения"
                tooltip="Когда долг должен быть полностью закрыт"
              >
                <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="note" label="Примечание">
            <Input.TextArea
              rows={3}
              placeholder="Например: № договора, условия рассрочки, аванс под объект"
            />
          </Form.Item>
        </Form>
      </FormModal>
    </>
  );
}
