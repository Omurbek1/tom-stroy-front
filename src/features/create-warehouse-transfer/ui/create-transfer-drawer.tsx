'use client';

import { Button, Col, Drawer, Form, Input, InputNumber, Row, Space } from 'antd';
import { DeleteOutlined, PlusOutlined, SwapOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { message } from '@shared/lib/antd-static';
import { WarehouseSelect } from '@shared/ui/warehouse-select';
import { MaterialSelect } from '@shared/ui/material-select';
import { FormSection } from '@shared/ui/form-section';
import { useCreateTransfer } from '@entities/warehouse-transfer/hooks';
import type { CreateTransferPayload } from '@entities/warehouse-transfer/types';

interface FormShape {
  fromWarehouseId: string;
  toWarehouseId: string;
  note?: string;
  lines: Array<{ itemId: string; qty: number }>;
}

export function CreateTransferDrawer() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<FormShape>();
  const mutation = useCreateTransfer();

  const fromId = Form.useWatch('fromWarehouseId', form);
  const toId = Form.useWatch('toWarehouseId', form);

  const onFinish = async (values: FormShape) => {
    const payload: CreateTransferPayload = {
      fromWarehouseId: values.fromWarehouseId,
      toWarehouseId: values.toWarehouseId,
      note: values.note,
      lines: (values.lines ?? []).map((l) => ({
        itemId: l.itemId,
        qty: Number(l.qty),
      })),
    };
    try {
      await mutation.mutateAsync(payload);
      message.success('Перемещение создано');
      form.resetFields();
      setOpen(false);
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Не удалось создать перемещение';
      message.error(typeof detail === 'string' ? detail : 'Не удалось создать перемещение');
    }
  };

  return (
    <>
      <Button icon={<SwapOutlined />} onClick={() => setOpen(true)}>
        Перемещение
      </Button>
      <Drawer
        title="Перемещение между складами"
        width={680}
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
          <FormSection title="Маршрут">
            <Row gutter={12}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="fromWarehouseId"
                  label="Откуда"
                  rules={[{ required: true, message: 'Выберите источник' }]}
                >
                  <WarehouseSelect placeholder="Источник" excludeId={toId} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="toWarehouseId"
                  label="Куда"
                  rules={[{ required: true, message: 'Выберите приёмник' }]}
                >
                  <WarehouseSelect placeholder="Приёмник" excludeId={fromId} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="note" label="Комментарий">
              <Input placeholder="Опционально — для накладной" />
            </Form.Item>
          </FormSection>

          <FormSection title="Позиции">
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
                      <Col flex="160px">
                        <Form.Item
                          name={[field.name, 'qty']}
                          rules={[
                            { required: true, message: '' },
                            { type: 'number', min: 0.0001 },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber
                            min={0}
                            style={{ width: '100%' }}
                            placeholder="Кол-во"
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
                  <Button
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    type="dashed"
                    block
                  >
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
                Создать
              </Button>
            </Space>
          </div>
        </Form>
      </Drawer>
    </>
  );
}
