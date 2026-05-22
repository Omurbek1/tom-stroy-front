'use client';

import { useEffect } from 'react';
import {
  Button,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Progress,
  Segmented,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, HistoryOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { message } from '@shared/lib/antd-static';
import { FormModal } from '@shared/ui/form-modal';
import { useFormDirty } from '@shared/hooks/use-form-dirty';
import {
  useAddDebtPayment,
  useDebt,
  useDeleteDebtPayment,
} from '@entities/debt/hooks';
import type { DebtPayment } from '@entities/debt/types';
import { formatDate, formatMoney } from '@shared/lib/format';

const METHOD_OPTIONS = [
  { value: 'cash', label: 'Наличными' },
  { value: 'bank', label: 'На счёт' },
  { value: 'card', label: 'Картой' },
];

const STATUS_TAG: Record<string, { color: string; label: string }> = {
  OPEN: { color: 'red', label: 'Открыт' },
  PARTIAL: { color: 'orange', label: 'Частично' },
  PAID: { color: 'green', label: 'Погашен' },
  WRITTEN_OFF: { color: 'default', label: 'Списан' },
};

type PaymentMode = 'FULL' | 'HALF' | 'PARTIAL';

interface FormShape {
  mode: PaymentMode;
  amount: number;
  date: Dayjs;
  method: 'cash' | 'bank' | 'card';
  note?: string;
}

const MODE_OPTIONS = [
  { value: 'FULL', label: 'Весь остаток' },
  { value: 'HALF', label: 'Половина' },
  { value: 'PARTIAL', label: 'Своя сумма' },
];

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

interface Props {
  debtId: string | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Universal pay + history modal: shows the debt header (counterparty,
 * amount, progress), a quick-pay form on top, and the payments ledger
 * below — each row supports delete (rolls the debt status back).
 */
export function DebtPaymentDrawer({ debtId, open, onClose }: Props) {
  const { data: debt, isLoading } = useDebt(debtId ?? undefined);
  const [form] = Form.useForm<FormShape>();
  const dirty = useFormDirty(form);
  const addPayment = useAddDebtPayment(debtId ?? '');
  const deletePayment = useDeleteDebtPayment(debtId ?? '');

  const remaining = debt ? Number(debt.amount) - Number(debt.paid) : 0;
  const mode = Form.useWatch('mode', form) as PaymentMode | undefined;
  const enteredAmount = Form.useWatch('amount', form) as number | undefined;
  const afterPayment = Math.max(0, remaining - (enteredAmount ?? 0));

  // When the debt loads or remaining changes (after a payment), recompute the
  // default amount for FULL / HALF modes — keeps the input aligned with the
  // current remaining without forcing the user to retype.
  useEffect(() => {
    if (!debt || !open) return;
    const current = mode ?? 'FULL';
    if (current === 'FULL') form.setFieldValue('amount', roundMoney(remaining));
    else if (current === 'HALF') form.setFieldValue('amount', roundMoney(remaining / 2));
  }, [remaining, mode, open, debt, form]);

  const handleModeChange = (next: PaymentMode) => {
    if (next === 'FULL') form.setFieldValue('amount', roundMoney(remaining));
    else if (next === 'HALF') form.setFieldValue('amount', roundMoney(remaining / 2));
    // PARTIAL: keep whatever the user already typed
  };

  const onFinish = async (v: FormShape) => {
    try {
      await addPayment.mutateAsync({
        amount: v.amount,
        date: v.date.toISOString(),
        method: v.method,
        note: v.note?.trim() || undefined,
      });
      const wasFull = v.amount + 0.005 >= remaining;
      message.success(wasFull ? 'Долг полностью погашен' : 'Платёж записан');
      form.resetFields();
      onClose();
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? // @ts-expect-error axios shape
            e.response?.data?.message
          : null;
      message.error(msg ?? 'Не удалось сохранить платёж');
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      await deletePayment.mutateAsync(paymentId);
      message.success('Платёж удалён');
    } catch {
      message.error('Не удалось удалить платёж');
    }
  };

  const paymentColumns: ColumnsType<DebtPayment> = [
    { title: 'Дата', dataIndex: 'date', key: 'date', width: 110, render: (v: string) => formatDate(v) },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      align: 'right',
      render: (v: number) => <strong>{formatMoney(v)}</strong>,
    },
    {
      title: 'Способ',
      dataIndex: 'method',
      key: 'method',
      width: 120,
      render: (v: string | null) =>
        METHOD_OPTIONS.find((o) => o.value === v)?.label ?? v ?? '—',
    },
    { title: 'Примечание', dataIndex: 'note', key: 'note', ellipsis: true, render: (v) => v ?? '—' },
    {
      title: '',
      key: 'actions',
      width: 50,
      align: 'right',
      render: (_, r) => (
        <Popconfirm
          title="Удалить платёж?"
          description="Сумма вернётся в остаток долга"
          onConfirm={() => handleDeletePayment(r.id)}
          okButtonProps={{ danger: true }}
        >
          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const payments = debt?.payments ?? [];
  const status = debt ? STATUS_TAG[debt.status] : null;
  const progress = debt && Number(debt.amount) > 0
    ? Math.min(100, Math.round((Number(debt.paid) / Number(debt.amount)) * 100))
    : 0;
  const isClosed = debt?.status === 'PAID' || debt?.status === 'WRITTEN_OFF';

  return (
    <FormModal
      title={
        debt
          ? `${debt.kind === 'PAYABLE' ? 'Мы должны' : 'Нам должен'}: ${debt.counterparty}`
          : 'Долг'
      }
      subtitle="Запись платежа и история всех операций по долгу"
      open={open}
      onClose={onClose}
      width={780}
      dirty={dirty}
      onSubmit={() => form.submit()}
      footer={
        !isClosed && (
          <Button
            type="primary"
            size="large"
            block
            loading={addPayment.isPending}
            disabled={remaining <= 0}
            onClick={() => form.submit()}
          >
            Записать платёж
          </Button>
        )
      }
    >
      <div style={{ padding: 24 }}>
        {isLoading || !debt ? (
          <Skeleton active />
        ) : (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div className="debt-header">
              <div className="debt-header__row">
                {status && <Tag color={status.color}>{status.label}</Tag>}
                {debt.dueDate && (
                  <span className="debt-header__muted">
                    Срок: {formatDate(debt.dueDate)}
                  </span>
                )}
                {debt.project && (
                  <span className="debt-header__muted">Объект: {debt.project.name}</span>
                )}
              </div>
              <div className="debt-header__amounts">
                <div>
                  <div className="debt-header__label">Сумма долга</div>
                  <div className="debt-header__value">{formatMoney(Number(debt.amount))}</div>
                </div>
                <div>
                  <div className="debt-header__label">Оплачено</div>
                  <div
                    className="debt-header__value"
                    style={{ color: 'var(--finance-income, #389e0d)' }}
                  >
                    {formatMoney(Number(debt.paid))}
                  </div>
                </div>
                <div>
                  <div className="debt-header__label">Остаток</div>
                  <div
                    className="debt-header__value"
                    style={{ color: remaining > 0 ? 'var(--finance-expense, #cf1322)' : '#8c8c8c' }}
                  >
                    {formatMoney(Math.max(0, remaining))}
                  </div>
                </div>
              </div>
              <Progress
                percent={progress}
                showInfo={false}
                strokeColor={progress >= 100 ? '#52c41a' : '#1677ff'}
              />
              {debt.note && <div className="debt-header__note">{debt.note}</div>}
            </div>

            {!isClosed && (
              <div className="debt-pay">
                <div className="debt-pay__title">Записать платёж</div>
                <Form<FormShape>
                  form={form}
                  layout="vertical"
                  size="large"
                  requiredMark="optional"
                  onFinish={onFinish}
                  initialValues={{
                    date: dayjs(),
                    method: 'cash',
                    mode: 'FULL',
                    amount: roundMoney(remaining),
                  }}
                >
                  <Form.Item
                    name="mode"
                    label="Тип платежа"
                    rules={[{ required: true }]}
                    style={{ marginBottom: 12 }}
                  >
                    <Segmented
                      block
                      options={MODE_OPTIONS}
                      onChange={(v) => handleModeChange(v as PaymentMode)}
                    />
                  </Form.Item>
                  <Space.Compact style={{ width: '100%' }}>
                    <Form.Item
                      name="amount"
                      label="Сумма платежа"
                      rules={[{ required: true, message: 'Введите сумму' }]}
                      style={{ flex: 1, marginBottom: 12 }}
                      extra={
                        <div className="debt-pay__hint">
                          <span>
                            К оплате: <strong>{formatMoney(remaining)}</strong>
                          </span>
                          <span
                            style={{
                              color:
                                afterPayment === 0
                                  ? 'var(--finance-income, #389e0d)'
                                  : undefined,
                            }}
                          >
                            После платежа останется:{' '}
                            <strong>{formatMoney(afterPayment)}</strong>
                          </span>
                        </div>
                      }
                    >
                      <InputNumber
                        placeholder="Сумма"
                        min={0.01}
                        max={remaining}
                        disabled={mode === 'FULL'}
                        style={{ width: '100%' }}
                        formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                        parser={(v) => Number(`${v}`.replace(/\s/g, '')) as 0.01}
                        addonAfter="сом"
                      />
                    </Form.Item>
                    <Form.Item name="date" rules={[{ required: true }]} style={{ marginBottom: 12 }}>
                      <DatePicker format="DD.MM.YYYY" />
                    </Form.Item>
                    <Form.Item
                      name="method"
                      rules={[{ required: true }]}
                      style={{ marginBottom: 12, width: 180 }}
                    >
                      <Select options={METHOD_OPTIONS} />
                    </Form.Item>
                  </Space.Compact>
                  <Form.Item name="note" style={{ marginBottom: 0 }}>
                    <Input placeholder="Примечание (опционально)" />
                  </Form.Item>
                </Form>
              </div>
            )}

            <div>
              <div className="debt-history__title">
                <HistoryOutlined /> История оплат
                <Tag style={{ marginLeft: 8 }}>{payments.length}</Tag>
              </div>
              {payments.length === 0 ? (
                <Empty
                  description="Платежей пока не было"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <Table<DebtPayment>
                  rowKey="id"
                  size="small"
                  columns={paymentColumns}
                  dataSource={payments}
                  pagination={false}
                  scroll={{ x: 580 }}
                />
              )}
            </div>
          </Space>
        )}
      </div>
    </FormModal>
  );
}
