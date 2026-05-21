'use client';

import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
} from 'antd';
import {
  DeleteOutlined,
  ExportOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { message } from '@shared/lib/antd-static';
import { FormModal } from '@shared/ui/form-modal';
import { useFormDirty } from '@shared/hooks/use-form-dirty';
import { FormSection } from '@shared/ui/form-section';
import { WarehouseSelect } from '@shared/ui/warehouse-select';
import { ProjectSelect } from '@shared/ui/project-select';
import { MaterialSelect } from '@shared/ui/material-select';
import { useCreateMovementsBatch } from '@entities/inventory-item/hooks';

interface FormShape {
  warehouseId: string;
  projectId?: string;
  note?: string;
  lines: Array<{ itemId: string; qty: number }>;
}

interface Props {
  trigger?: React.ReactNode;
}

export function CreateStockWriteoffDrawer({ trigger }: Props = {}) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<FormShape>();
  const mutation = useCreateMovementsBatch();
  const dirty = useFormDirty(form);

  const close = () => setOpen(false);

  const onFinish = async (values: FormShape) => {
    const movements = (values.lines ?? []).map((l) => ({
      itemId: l.itemId,
      warehouseId: values.warehouseId,
      movementType: 'WRITE_OFF' as const,
      qty: Number(l.qty),
      projectId: values.projectId,
      note: values.note,
    }));
    try {
      await mutation.mutateAsync(movements);
      message.success(`Списано позиций: ${movements.length}`);
      form.resetFields();
      close();
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Не удалось списать';
      message.error(typeof detail === 'string' ? detail : 'Не удалось списать');
    }
  };

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <Button icon={<ExportOutlined />} onClick={() => setOpen(true)}>
          Списание
        </Button>
      )}
      <FormModal
        title="Списание материалов"
        subtitle="Цена берётся из текущей себестоимости (WAC)"
        open={open}
        onClose={close}
        width={680}
        dirty={dirty}
        onSubmit={() => form.submit()}
        footer={
          <Space>
            <Button onClick={close}>Отмена</Button>
            <Button
              type="primary"
              danger
              loading={mutation.isPending}
              onClick={() => form.submit()}
            >
              Списать
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
          <FormSection title="Параметры">
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
                <Form.Item name="projectId" label="На объект">
                  <ProjectSelect placeholder="Опционально — куда уходит" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="note" label="Комментарий">
              <Input placeholder="Например: списано на блок А" />
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
                          <InputNumber min={0} style={{ width: '100%' }} placeholder="Кол-во" />
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
