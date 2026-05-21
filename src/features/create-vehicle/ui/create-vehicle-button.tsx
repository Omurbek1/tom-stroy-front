'use client';

import { Button, Form, Input, InputNumber, Select } from 'antd';
import { message } from '@shared/lib/antd-static';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useCreateVehicle } from '@entities/vehicle/hooks';
import type { CreateVehiclePayload } from '@entities/vehicle/types';
import { FormModal } from '@shared/ui/form-modal';
import { useFormDirty } from '@shared/hooks/use-form-dirty';
import { EmployeeSelect } from '@shared/ui/employee-select';
import { VEHICLE_STATUS_OPTIONS } from '@shared/constants/vehicle-status';

const TYPES = ['Экскаватор', 'КамАЗ', 'Кран', 'Бетономешалка', 'Генератор', 'Прочее'];

export function CreateVehicleButton() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<CreateVehiclePayload>();
  const mutation = useCreateVehicle();
  const dirty = useFormDirty(form);

  const onFinish = async (v: CreateVehiclePayload) => {
    try {
      await mutation.mutateAsync(v);
      message.success('Техника добавлена');
      form.resetFields();
      setOpen(false);
    } catch {
      message.error('Не удалось добавить');
    }
  };

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
        Техника
      </Button>
      <FormModal
        title="Новая единица техники"
        width={460}
        open={open}
        onClose={() => setOpen(false)}
        dirty={dirty}
        onSubmit={() => form.submit()}
      >
        <Form<CreateVehiclePayload>
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ status: 'idle' }}
        >
          <Form.Item name="type" label="Тип" rules={[{ required: true }]}>
            <Select options={TYPES.map((t) => ({ value: t, label: t }))} />
          </Form.Item>
          <Form.Item name="plate" label="Гос. номер">
            <Input />
          </Form.Item>
          <Form.Item name="driverId" label="Водитель">
            <EmployeeSelect roleFilter={['DRIVER']} placeholder="Выберите водителя" />
          </Form.Item>
          <Form.Item name="fuelLitres" label="Бак, литров">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="Статус">
            <Select options={VEHICLE_STATUS_OPTIONS} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={mutation.isPending} block>
            Сохранить
          </Button>
        </Form>
      </FormModal>
    </>
  );
}
