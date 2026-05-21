'use client';

import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Segmented,
  Space,
} from 'antd';
import { DeleteOutlined, PlusOutlined, SwapOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { message } from '@shared/lib/antd-static';
import { FormModal } from '@shared/ui/form-modal';
import { useFormDirty } from '@shared/hooks/use-form-dirty';
import { WarehouseSelect } from '@shared/ui/warehouse-select';
import { BrigadeSelect } from '@shared/ui/brigade-select';
import { MaterialSelect } from '@shared/ui/material-select';
import { FormSection } from '@shared/ui/form-section';
import { useCreateTransfer } from '@entities/warehouse-transfer/hooks';
import type { CreateTransferPayload } from '@entities/warehouse-transfer/types';
import { ensureBrigadeWarehouse } from '@entities/brigade/api';

type DestKind = 'warehouse' | 'brigade';

interface FormShape {
  fromWarehouseId: string;
  destKind: DestKind;
  toWarehouseId?: string;
  toBrigadeId?: string;
  note?: string;
  lines: Array<{ itemId: string; qty: number }>;
}

export function CreateTransferDrawer() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<FormShape>();
  const mutation = useCreateTransfer();
  const dirty = useFormDirty(form);
  const [resolving, setResolving] = useState(false);

  const fromId = Form.useWatch('fromWarehouseId', form);
  const toWarehouseId = Form.useWatch('toWarehouseId', form);
  const destKind = (Form.useWatch('destKind', form) ?? 'warehouse') as DestKind;

  const close = () => setOpen(false);

  const onFinish = async (values: FormShape) => {
    let toWarehouse = values.toWarehouseId;
    if (values.destKind === 'brigade') {
      if (!values.toBrigadeId) {
        message.error('Выберите бригаду');
        return;
      }
      setResolving(true);
      try {
        toWarehouse = await ensureBrigadeWarehouse(values.toBrigadeId);
      } catch {
        message.error('Не удалось определить склад бригады');
        setResolving(false);
        return;
      }
      setResolving(false);
    }
    if (!toWarehouse) {
      message.error('Выберите приёмник');
      return;
    }
    if (toWarehouse === values.fromWarehouseId) {
      message.error('Источник и приёмник не могут совпадать');
      return;
    }

    const payload: CreateTransferPayload = {
      fromWarehouseId: values.fromWarehouseId,
      toWarehouseId: toWarehouse,
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
      close();
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
      <FormModal
        title="Перемещение материалов"
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
              loading={mutation.isPending || resolving}
              onClick={() => form.submit()}
            >
              Создать
            </Button>
          </Space>
        }
      >
        <Form<FormShape>
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          initialValues={{ lines: [{}], destKind: 'warehouse' }}
        >
          <FormSection title="Маршрут">
            <Form.Item
              name="fromWarehouseId"
              label="Откуда (склад)"
              rules={[{ required: true, message: 'Выберите источник' }]}
            >
              <WarehouseSelect placeholder="Источник" excludeId={toWarehouseId} />
            </Form.Item>

            <Form.Item name="destKind" label="Куда">
              <Segmented
                options={[
                  { label: 'На склад', value: 'warehouse' },
                  { label: 'Бригаде', value: 'brigade' },
                ]}
                block
              />
            </Form.Item>

            {destKind === 'warehouse' && (
              <Form.Item
                name="toWarehouseId"
                label="Склад приёмки"
                rules={[{ required: true, message: 'Выберите склад' }]}
              >
                <WarehouseSelect placeholder="Приёмник" excludeId={fromId} />
              </Form.Item>
            )}
            {destKind === 'brigade' && (
              <Form.Item
                name="toBrigadeId"
                label="Бригада"
                rules={[{ required: true, message: 'Выберите бригаду' }]}
                extra="Материалы попадут на личный склад бригады."
              >
                <BrigadeSelect placeholder="Бригада" />
              </Form.Item>
            )}

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
