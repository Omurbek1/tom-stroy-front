'use client';

import { Button, Col, Form, Input, InputNumber, Row, Select } from 'antd';
import { AppstoreAddOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { message } from '@shared/lib/antd-static';
import { FormModal } from '@shared/ui/form-modal';
import { WarehouseSelect } from '@shared/ui/warehouse-select';
import { useCreateInventoryItem } from '@entities/inventory-item/hooks';
import type { CreateInventoryItemPayload } from '@entities/inventory-item/api';

const UNIT_OPTIONS = [
  { value: 'шт', label: 'шт' },
  { value: 'м', label: 'м' },
  { value: 'м²', label: 'м²' },
  { value: 'м³', label: 'м³' },
  { value: 'кг', label: 'кг' },
  { value: 'т', label: 'т' },
  { value: 'мешок', label: 'мешок' },
  { value: 'л', label: 'л' },
  { value: 'упак', label: 'упак' },
];

export function CreateInventoryItemButton() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<CreateInventoryItemPayload>();
  const mutation = useCreateInventoryItem();
  const close = () => setOpen(false);

  const onFinish = async (values: CreateInventoryItemPayload) => {
    try {
      await mutation.mutateAsync(values);
      message.success('Товар добавлен');
      form.resetFields();
      close();
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Не удалось добавить товар';
      message.error(typeof detail === 'string' ? detail : 'Не удалось добавить товар');
    }
  };

  return (
    <>
      <Button icon={<AppstoreAddOutlined />} type="primary" onClick={() => setOpen(true)}>
        Новый товар
      </Button>
      <FormModal
        title="Новый товар"
        subtitle="Карточка материала. Остаток можно вводить здесь или позже через «Приход»."
        open={open}
        onClose={close}
        width={620}
        footer={
          <>
            <Button onClick={close} style={{ marginRight: 8 }}>
              Отмена
            </Button>
            <Button
              type="primary"
              loading={mutation.isPending}
              onClick={() => form.submit()}
            >
              Создать
            </Button>
          </>
        }
      >
        <div style={{ padding: 20 }}>
          <Form<CreateInventoryItemPayload>
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            initialValues={{ unit: 'шт', onHand: 0, costPrice: 0, minStock: 0 }}
          >
            <Form.Item
              name="name"
              label="Название"
              rules={[{ required: true, message: 'Введите название' }]}
            >
              <Input placeholder="Например: Цемент М500" autoFocus />
            </Form.Item>

            <Row gutter={12}>
              <Col xs={24} md={16}>
                <Form.Item
                  name="warehouseId"
                  label="Склад"
                  rules={[{ required: true, message: 'Выберите склад' }]}
                >
                  <WarehouseSelect />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="unit" label="Ед. изм.">
                  <Select
                    options={UNIT_OPTIONS}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="category" label="Категория">
              <Input placeholder="Например: Бетон, Кладочные материалы" />
            </Form.Item>

            <Row gutter={12}>
              <Col xs={24} md={8}>
                <Form.Item name="onHand" label="Начальный остаток">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="costPrice" label="Себестоимость">
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    addonAfter="₸"
                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="minStock" label="Мин. остаток">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </FormModal>
    </>
  );
}
