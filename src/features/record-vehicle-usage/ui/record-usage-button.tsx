'use client';

import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { useRecordUsage, useVehicles } from '@entities/vehicle/hooks';

interface FormShape {
  vehicleId: string;
  projectId?: string;
  date: Dayjs;
  hoursUsed?: number;
  fuelUsed?: number;
  cost?: number;
  note?: string;
}

export function RecordUsageButton({ projectId }: { projectId?: string } = {}) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<FormShape>();
  const { data: vehicles } = useVehicles();
  const mutation = useRecordUsage();

  const onFinish = async (v: FormShape) => {
    try {
      await mutation.mutateAsync({
        vehicleId: v.vehicleId,
        projectId: v.projectId || projectId,
        date: v.date.toISOString(),
        hoursUsed: v.hoursUsed,
        fuelUsed: v.fuelUsed,
        cost: v.cost,
        note: v.note,
      });
      message.success('Использование зафиксировано');
      form.resetFields();
      setOpen(false);
    } catch {
      message.error('Не удалось сохранить');
    }
  };

  return (
    <>
      <Button icon={<PlusOutlined />} onClick={() => setOpen(true)}>
        Использование
      </Button>
      <Drawer
        title="Использование техники"
        width={420}
        open={open}
        onClose={() => setOpen(false)}
        destroyOnHidden
      >
        <Form<FormShape>
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ date: dayjs() }}
        >
          <Form.Item name="vehicleId" label="Техника" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={(vehicles?.data ?? []).map((v) => ({
                value: v.id,
                label: `${v.type}${v.plate ? ` · ${v.plate}` : ''}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="date" label="Дата" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
          {!projectId && (
            <Form.Item name="projectId" label="ID объекта (опционально)">
              <Input />
            </Form.Item>
          )}
          <Form.Item name="hoursUsed" label="Часы работы">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="fuelUsed" label="Топливо, литров">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="cost" label="Стоимость">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="note" label="Комментарий">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={mutation.isPending} block>
            Сохранить
          </Button>
        </Form>
      </Drawer>
    </>
  );
}
