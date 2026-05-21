'use client';

import { Button, Form, Input, Select } from 'antd';
import { message } from '@shared/lib/antd-static';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useCreateBrigade } from '@entities/brigade/hooks';
import { useEmployees } from '@entities/employee/hooks';
import type { CreateBrigadePayload } from '@entities/brigade/types';
import { FormModal } from '@shared/ui/form-modal';
import { useFormDirty } from '@shared/hooks/use-form-dirty';

export function CreateBrigadeButton() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<CreateBrigadePayload>();
  const dirty = useFormDirty(form);
  const mutation = useCreateBrigade();
  const { data: employees } = useEmployees();

  const foremanOptions = (employees?.data ?? [])
    .filter((e) => e.role === 'FOREMAN')
    .map((e) => ({ value: e.id, label: e.fullName }));

  const onFinish = async (v: CreateBrigadePayload) => {
    try {
      await mutation.mutateAsync(v);
      message.success('Бригада создана');
      form.resetFields();
      setOpen(false);
    } catch {
      message.error('Не удалось создать');
    }
  };

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
        Новая бригада
      </Button>
      <FormModal
        title="Новая бригада"
        open={open}
        onClose={() => setOpen(false)}
        width={460}
        dirty={dirty}
        onSubmit={() => form.submit()}
      >
        <Form<CreateBrigadePayload> form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Название" rules={[{ required: true }]}>
            <Input placeholder="Бригада №1, Каменщики" />
          </Form.Item>
          <Form.Item name="specialization" label="Специализация">
            <Input placeholder="монолит / отделка / кровля" />
          </Form.Item>
          <Form.Item name="foremanId" label="Прораб">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              options={foremanOptions}
              placeholder="Выберите прораба"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={mutation.isPending} block>
            Создать
          </Button>
        </Form>
      </FormModal>
    </>
  );
}
