'use client';

import { Button, Form, Input, Modal } from 'antd';
import { AuditOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { message } from '@shared/lib/antd-static';
import { WarehouseSelect } from '@shared/ui/warehouse-select';
import { useOpenStockCount } from '@entities/stock-count/hooks';

interface FormShape {
  warehouseId: string;
  note?: string;
}

interface Props {
  onOpened?: (id: string) => void;
}

export function OpenStockCountModal({ onOpened }: Props) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<FormShape>();
  const mutation = useOpenStockCount();

  const onFinish = async (values: FormShape) => {
    try {
      const created = await mutation.mutateAsync(values);
      message.success('Инвентаризация начата');
      form.resetFields();
      setOpen(false);
      onOpened?.(created.id);
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Не удалось начать инвентаризацию';
      message.error(typeof detail === 'string' ? detail : 'Не удалось начать инвентаризацию');
    }
  };

  return (
    <>
      <Button icon={<AuditOutlined />} type="primary" onClick={() => setOpen(true)}>
        Начать инвентаризацию
      </Button>
      <Modal
        title="Новая инвентаризация"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText="Начать"
        cancelText="Отмена"
        confirmLoading={mutation.isPending}
        destroyOnClose
      >
        <Form<FormShape> form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="warehouseId"
            label="Склад"
            rules={[{ required: true, message: 'Выберите склад' }]}
          >
            <WarehouseSelect />
          </Form.Item>
          <Form.Item name="note" label="Комментарий">
            <Input.TextArea
              placeholder="Например: плановая инвентаризация мая"
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
