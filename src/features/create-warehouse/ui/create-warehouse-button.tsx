'use client';

import { Button, Form, Input, Select } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { message } from '@shared/lib/antd-static';
import { FormModal } from '@shared/ui/form-modal';
import {
  useCreateWarehouse,
  type CreateWarehousePayload,
  type WarehouseKind,
} from '@entities/warehouse/hooks';

const KIND_OPTIONS: Array<{ value: WarehouseKind; label: string }> = [
  { value: 'MAIN', label: 'Главный склад' },
  { value: 'PROJECT', label: 'Склад объекта' },
  { value: 'TEMP', label: 'Временный / транзит' },
];

export function CreateWarehouseButton() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<CreateWarehousePayload>();
  const mutation = useCreateWarehouse();
  const close = () => setOpen(false);

  const onFinish = async (values: CreateWarehousePayload) => {
    try {
      await mutation.mutateAsync(values);
      message.success('Склад создан');
      form.resetFields();
      close();
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Не удалось создать склад';
      message.error(typeof detail === 'string' ? detail : 'Не удалось создать склад');
    }
  };

  return (
    <>
      <Button icon={<ShopOutlined />} onClick={() => setOpen(true)}>
        Новый склад
      </Button>
      <FormModal
        title="Новый склад"
        open={open}
        onClose={close}
        width={520}
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
          <Form<CreateWarehousePayload>
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            initialValues={{ kind: 'MAIN' }}
          >
            <Form.Item
              name="name"
              label="Название"
              rules={[{ required: true, message: 'Введите название' }]}
            >
              <Input placeholder="Например: Главный склад" autoFocus />
            </Form.Item>
            <Form.Item name="kind" label="Тип">
              <Select options={KIND_OPTIONS} />
            </Form.Item>
            <Form.Item name="address" label="Адрес">
              <Input placeholder="г. Бишкек, ул. ..." />
            </Form.Item>
          </Form>
        </div>
      </FormModal>
    </>
  );
}
