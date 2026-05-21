'use client';

import { Button, Col, Form, Input, Modal, Row } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { message } from '@shared/lib/antd-static';
import { useCreateSupplier } from '@entities/supplier/hooks';
import type { CreateSupplierPayload } from '@entities/supplier/types';

export function CreateSupplierModal() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<CreateSupplierPayload>();
  const mutation = useCreateSupplier();

  const onFinish = async (values: CreateSupplierPayload) => {
    try {
      await mutation.mutateAsync(values);
      message.success('Поставщик создан');
      form.resetFields();
      setOpen(false);
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Не удалось создать поставщика';
      message.error(typeof detail === 'string' ? detail : 'Не удалось создать поставщика');
    }
  };

  return (
    <>
      <Button icon={<PlusOutlined />} onClick={() => setOpen(true)}>
        Поставщик
      </Button>
      <Modal
        title="Новый поставщик"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText="Создать"
        cancelText="Отмена"
        confirmLoading={mutation.isPending}
        destroyOnClose
      >
        <Form<CreateSupplierPayload>
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label="Название"
            rules={[{ required: true, message: 'Введите название' }]}
          >
            <Input placeholder="ООО «Стройматериалы»" autoFocus />
          </Form.Item>
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="phone" label="Телефон">
                <Input placeholder="+996 700 000 000" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
                <Input placeholder="info@example.kg" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="inn" label="ИНН">
                <Input placeholder="00000000000000" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="address" label="Адрес">
                <Input placeholder="г. Бишкек, ул. ..." />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notes" label="Заметки">
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
