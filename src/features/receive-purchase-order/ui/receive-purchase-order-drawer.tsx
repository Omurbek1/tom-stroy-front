'use client';

import {
  Alert,
  Button,
  Col,
  Drawer,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Tag,
} from 'antd';
import { useEffect } from 'react';
import { message } from '@shared/lib/antd-static';
import { FormSection } from '@shared/ui/form-section';
import { useReceivePurchaseOrder } from '@entities/purchase-order/hooks';
import type { PurchaseOrder } from '@entities/purchase-order/types';
import { formatMoney, formatNumber } from '@shared/lib/format';

interface FormShape {
  note?: string;
  lines: Array<{ itemId: string; qty: number }>;
}

interface Props {
  order: PurchaseOrder | null;
  open: boolean;
  onClose: () => void;
}

export function ReceivePurchaseOrderDrawer({ order, open, onClose }: Props) {
  const [form] = Form.useForm<FormShape>();
  const mutation = useReceivePurchaseOrder();

  useEffect(() => {
    if (!order || !open) return;
    form.setFieldsValue({
      lines: order.items.map((it) => ({
        itemId: it.itemId,
        qty: Math.max(0, Number(it.qty) - Number(it.qtyReceived)),
      })),
    });
  }, [order, open, form]);

  if (!order) return null;

  const onFinish = async (values: FormShape) => {
    const linesToSend = values.lines
      .filter((l) => Number(l.qty) > 0)
      .map((l) => ({ itemId: l.itemId, qty: Number(l.qty) }));
    if (linesToSend.length === 0) {
      message.warning('Нет позиций к приёмке');
      return;
    }
    try {
      await mutation.mutateAsync({
        id: order.id,
        payload: { lines: linesToSend, note: values.note },
      });
      message.success('Принято');
      onClose();
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Не удалось принять';
      message.error(typeof detail === 'string' ? detail : 'Не удалось принять');
    }
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>
            Приёмка {order.number ?? `№${order.id.slice(-6).toUpperCase()}`}
          </span>
          <span style={{ fontSize: 12, color: 'var(--ant-color-text-secondary, #8c8c8c)' }}>
            {order.supplier?.name} • {order.warehouse?.name ?? 'без склада'}
          </span>
        </div>
      }
      width={680}
      open={open}
      onClose={onClose}
      destroyOnClose
      styles={{ body: { paddingBottom: 0 }, header: { padding: '14px 20px' } }}
    >
      <Form<FormShape> form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Alert
          type="info"
          showIcon
          message="По умолчанию подставлены остатки. Если поставщик привёз меньше — уменьши количество, можно довести позже."
          style={{ marginBottom: 16 }}
        />

        <FormSection title="Позиции">
          <Form.List name="lines">
            {(fields) => (
              <>
                {fields.map((field, idx) => {
                  const orderLine = order.items[idx];
                  const left = Number(orderLine.qty) - Number(orderLine.qtyReceived);
                  return (
                    <Row
                      key={field.key}
                      gutter={8}
                      align="middle"
                      style={{ marginBottom: 10 }}
                    >
                      <Col flex="auto">
                        <div style={{ fontWeight: 500 }}>{orderLine.item?.name ?? '—'}</div>
                        <div
                          style={{
                            fontSize: 12,
                            color: 'var(--ant-color-text-secondary, #8c8c8c)',
                          }}
                        >
                          Заказано {formatNumber(orderLine.qty)} {orderLine.item?.unit} •
                          {' '}{formatMoney(orderLine.unitCost)} / ед.
                        </div>
                      </Col>
                      <Col flex="100px" style={{ textAlign: 'right' }}>
                        <Tag color={left > 0 ? 'gold' : 'green'}>
                          Осталось {formatNumber(left)} {orderLine.item?.unit}
                        </Tag>
                      </Col>
                      <Col flex="140px">
                        <Form.Item
                          name={[field.name, 'qty']}
                          rules={[
                            { required: true, message: '' },
                            { type: 'number', min: 0, max: left, message: `Не больше ${left}` },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber
                            min={0}
                            max={left}
                            style={{ width: '100%' }}
                            disabled={left <= 0}
                            placeholder="Принято"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  );
                })}
              </>
            )}
          </Form.List>
        </FormSection>

        <FormSection title="Накладная (опционально)">
          <Form.Item name="note" label="Номер ТТН / комментарий" style={{ marginBottom: 0 }}>
            <Input placeholder="ТТН-2026-001 от 21.05.2026" />
          </Form.Item>
        </FormSection>

        <div
          style={{
            position: 'sticky',
            bottom: -20,
            marginLeft: -20,
            marginRight: -20,
            marginBottom: -20,
            padding: '12px 20px',
            background: 'var(--ant-color-bg-container, #fff)',
            borderTop: '1px solid var(--ant-color-border-secondary, #f0f0f0)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
          }}
        >
          <Space>
            <Button onClick={onClose}>Отмена</Button>
            <Button type="primary" htmlType="submit" loading={mutation.isPending}>
              Принять
            </Button>
          </Space>
        </div>
      </Form>
    </Drawer>
  );
}
