'use client';

import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
} from 'antd';
import { DeleteOutlined, LockOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { message } from '@shared/lib/antd-static';
import { FormModal } from '@shared/ui/form-modal';
import { FormSection } from '@shared/ui/form-section';
import { WarehouseSelect } from '@shared/ui/warehouse-select';
import { ProjectSelect } from '@shared/ui/project-select';
import { MaterialSelect } from '@shared/ui/material-select';
import { useCreateReservation } from '@entities/warehouse-reservation/hooks';
import type { CreateReservationPayload } from '@entities/warehouse-reservation/types';

interface FormShape {
  warehouseId: string;
  projectId?: string;
  expiresAt?: Dayjs;
  note?: string;
  lines: Array<{ itemId: string; qty: number }>;
}

export function CreateReservationDrawer() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<FormShape>();
  const mutation = useCreateReservation();

  const close = () => setOpen(false);

  const onFinish = async (values: FormShape) => {
    const payload: CreateReservationPayload = {
      warehouseId: values.warehouseId,
      projectId: values.projectId,
      expiresAt: values.expiresAt?.toISOString(),
      note: values.note,
      lines: (values.lines ?? []).map((l) => ({
        itemId: l.itemId,
        qty: Number(l.qty),
      })),
    };
    try {
      await mutation.mutateAsync(payload);
      message.success('Резерв создан');
      form.resetFields();
      close();
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Не удалось создать резерв';
      message.error(typeof detail === 'string' ? detail : 'Не удалось создать резерв');
    }
  };

  return (
    <>
      <Button icon={<LockOutlined />} type="primary" onClick={() => setOpen(true)}>
        Зарезервировать
      </Button>
      <FormModal
        title="Новый резерв"
        open={open}
        onClose={close}
        width={680}
        footer={
          <Space>
            <Button onClick={close}>Отмена</Button>
            <Button
              type="primary"
              loading={mutation.isPending}
              onClick={() => form.submit()}
            >
              Зарезервировать
            </Button>
          </Space>
        }
      >
        <Form<FormShape>
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          initialValues={{ lines: [{}] }}
        >
          <FormSection title="Параметры резерва">
            <Row gutter={12}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="warehouseId"
                  label="Склад"
                  rules={[{ required: true, message: 'Выберите склад' }]}
                >
                  <WarehouseSelect />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="projectId" label="Объект">
                  <ProjectSelect placeholder="Опционально — под какой объект" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col xs={24} md={12}>
                <Form.Item name="expiresAt" label="Срок действия">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD.MM.YYYY"
                    placeholder="Опционально"
                    disabledDate={(d) => d && d.isBefore(dayjs().startOf('day'))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="note" label="Комментарий">
                  <Input placeholder="Например: для блока А" />
                </Form.Item>
              </Col>
            </Row>
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
                  <Button onClick={() => add()} icon={<PlusOutlined />} type="dashed" block>
                    Добавить позицию
                  </Button>
                </>
              )}
            </Form.List>
          </FormSection>
        </Form>
      </FormModal>
    </>
  );
}
