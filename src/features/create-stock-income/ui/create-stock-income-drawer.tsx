'use client';

import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Tag,
} from 'antd';
import {
  DeleteOutlined,
  ImportOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { message } from '@shared/lib/antd-static';
import { FormModal } from '@shared/ui/form-modal';
import { useFormDirty } from '@shared/hooks/use-form-dirty';
import { FormSection } from '@shared/ui/form-section';
import { WarehouseSelect } from '@shared/ui/warehouse-select';
import { MaterialSelect } from '@shared/ui/material-select';
import { useCreateMovementsBatch } from '@entities/inventory-item/hooks';
import { formatMoney } from '@shared/lib/format';

interface FormShape {
  warehouseId: string;
  note?: string;
  lines: Array<{ itemId: string; qty: number; unitCost: number }>;
}

interface Props {
  trigger?: React.ReactNode;
}

export function CreateStockIncomeDrawer({ trigger }: Props = {}) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<FormShape>();
  const mutation = useCreateMovementsBatch();
  const dirty = useFormDirty(form);

  const lines = Form.useWatch('lines', form);
  const total = useMemo(
    () =>
      (lines ?? []).reduce(
        (s, l) => s + Number(l?.qty ?? 0) * Number(l?.unitCost ?? 0),
        0,
      ),
    [lines],
  );

  const close = () => setOpen(false);

  const onFinish = async (values: FormShape) => {
    const movements = (values.lines ?? []).map((l) => ({
      itemId: l.itemId,
      warehouseId: values.warehouseId,
      movementType: 'INCOME' as const,
      qty: Number(l.qty),
      unitCost: Number(l.unitCost),
      note: values.note,
    }));
    try {
      await mutation.mutateAsync(movements);
      message.success(`Принято позиций: ${movements.length}`);
      form.resetFields();
      close();
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Не удалось оприходовать';
      message.error(typeof detail === 'string' ? detail : 'Не удалось оприходовать');
    }
  };

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <Button icon={<ImportOutlined />} onClick={() => setOpen(true)}>
          Приход
        </Button>
      )}
      <FormModal
        title="Приход материалов"
        subtitle="Для приёмки заказа от поставщика используйте «Закупки → Принять»"
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
              loading={mutation.isPending}
              onClick={() => form.submit()}
            >
              Оприходовать
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
                <Form.Item name="note" label="Комментарий">
                  <Input placeholder="Например: ввод начальных остатков" />
                </Form.Item>
              </Col>
            </Row>
          </FormSection>

          <FormSection
            title="Позиции"
            extra={total > 0 && <Tag color="green">Итого: {formatMoney(total)}</Tag>}
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
                          rules={[
                            { required: true, message: '' },
                            { type: 'number', min: 0.0001 },
                          ]}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber min={0} style={{ width: '100%' }} placeholder="Кол-во" />
                        </Form.Item>
                      </Col>
                      <Col flex="140px">
                        <Form.Item
                          name={[field.name, 'unitCost']}
                          rules={[
                            { required: true, message: '' },
                            { type: 'number', min: 0 },
                          ]}
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
        </Form>
      </FormModal>
    </>
  );
}
