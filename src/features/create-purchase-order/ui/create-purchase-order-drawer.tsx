'use client';

import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Tag,
} from 'antd';
import { DeleteOutlined, PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';
import { message } from '@shared/lib/antd-static';
import { FormSection } from '@shared/ui/form-section';
import { SupplierSelect } from '@shared/ui/supplier-select';
import { WarehouseSelect } from '@shared/ui/warehouse-select';
import { MaterialSelect } from '@shared/ui/material-select';
import { useCreatePurchaseOrder } from '@entities/purchase-order/hooks';
import type { CreatePurchaseOrderPayload } from '@entities/purchase-order/types';
import { formatMoney } from '@shared/lib/format';

interface FormShape {
  supplierId: string;
  warehouseId?: string;
  expectedAt?: Dayjs;
  note?: string;
  lines: Array<{ itemId: string; qty: number; unitCost: number }>;
}

export function CreatePurchaseOrderDrawer() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<FormShape>();
  const mutation = useCreatePurchaseOrder();

  const lines = Form.useWatch('lines', form);

  const total = useMemo(
    () =>
      (lines ?? []).reduce(
        (s, l) => s + Number(l?.qty ?? 0) * Number(l?.unitCost ?? 0),
        0,
      ),
    [lines],
  );

  const onFinish = async (values: FormShape) => {
    const payload: CreatePurchaseOrderPayload = {
      supplierId: values.supplierId,
      warehouseId: values.warehouseId,
      expectedAt: values.expectedAt?.toISOString(),
      note: values.note,
      lines: (values.lines ?? []).map((l) => ({
        itemId: l.itemId,
        qty: Number(l.qty),
        unitCost: Number(l.unitCost),
      })),
    };
    try {
      await mutation.mutateAsync(payload);
      message.success('Заявка создана');
      form.resetFields();
      setOpen(false);
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Не удалось создать заявку';
      message.error(typeof detail === 'string' ? detail : 'Не удалось создать заявку');
    }
  };

  return (
    <>
      <Button
        icon={<ShoppingCartOutlined />}
        type="primary"
        onClick={() => setOpen(true)}
      >
        Заявка на закуп
      </Button>
      <Drawer
        title="Новая заявка на закуп"
        width={720}
        open={open}
        onClose={() => setOpen(false)}
        destroyOnClose
        styles={{ body: { paddingBottom: 0 }, header: { padding: '14px 20px' } }}
      >
        <Form<FormShape>
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          initialValues={{ lines: [{}] }}
        >
          <FormSection title="Параметры заявки">
            <Row gutter={12}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="supplierId"
                  label="Поставщик"
                  rules={[{ required: true, message: 'Выберите поставщика' }]}
                >
                  <SupplierSelect />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="warehouseId" label="Куда (склад приёмки)">
                  <WarehouseSelect placeholder="Опционально" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col xs={24} md={12}>
                <Form.Item name="expectedAt" label="Ожидается">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD.MM.YYYY"
                    disabledDate={(d) => d && d.isBefore(dayjs().startOf('day'))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="note" label="Комментарий">
                  <Input placeholder="Опционально" />
                </Form.Item>
              </Col>
            </Row>
          </FormSection>

          <FormSection
            title="Позиции"
            extra={total > 0 && <Tag color="blue">Итого: {formatMoney(total)}</Tag>}
          >
            <Form.List name="lines">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <Row
                      key={field.key}
                      gutter={8}
                      align="top"
                      wrap={false}
                      style={{ marginBottom: 8 }}
                    >
                      <Col flex="auto">
                        <Form.Item
                          name={[field.name, 'itemId']}
                          rules={[{ required: true, message: '' }]}
                          style={{ marginBottom: 0 }}
                        >
                          <MaterialSelect placeholder="Материал" />
                        </Form.Item>
                      </Col>
                      <Col flex="130px">
                        <Form.Item
                          name={[field.name, 'qty']}
                          rules={[{ required: true, message: '' }]}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber min={0} style={{ width: '100%' }} placeholder="Кол-во" />
                        </Form.Item>
                      </Col>
                      <Col flex="140px">
                        <Form.Item
                          name={[field.name, 'unitCost']}
                          rules={[{ required: true, message: '' }]}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber
                            min={0}
                            style={{ width: '100%' }}
                            placeholder="Цена"
                            addonAfter="₸"
                            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                          />
                        </Form.Item>
                      </Col>
                      <Col flex="32px" style={{ paddingTop: 2 }}>
                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          danger
                          onClick={() => remove(field.name)}
                          disabled={fields.length === 1}
                        />
                      </Col>
                    </Row>
                  ))}
                  <Button onClick={() => add()} icon={<PlusOutlined />} type="dashed" block>
                    Добавить позицию
                  </Button>
                </>
              )}
            </Form.List>
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
              <Button onClick={() => setOpen(false)}>Отмена</Button>
              <Button type="primary" htmlType="submit" loading={mutation.isPending}>
                Создать черновик
              </Button>
            </Space>
          </div>
        </Form>
      </Drawer>
    </>
  );
}
