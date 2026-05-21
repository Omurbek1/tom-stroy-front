'use client';

import { Button, Form, Input, Select } from 'antd';
import { message } from '@shared/lib/antd-static';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useCreateBrigade } from '@entities/brigade/hooks';
import { useEmployees } from '@entities/employee/hooks';
import type { Brigade, CreateBrigadePayload } from '@entities/brigade/types';
import { FormModal } from '@shared/ui/form-modal';
import { useFormDirty } from '@shared/hooks/use-form-dirty';

interface CreateBrigadeModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (brigade: Brigade) => void;
}

export function CreateBrigadeModal({ open, onClose, onCreated }: CreateBrigadeModalProps) {
  const [form] = Form.useForm<CreateBrigadePayload>();
  const dirty = useFormDirty(form);
  const mutation = useCreateBrigade();
  const { data: employees } = useEmployees();

  const foremanOptions = (employees?.data ?? [])
    .filter((e) => e.role === 'FOREMAN')
    .map((e) => ({ value: e.id, label: e.fullName }));

  const onFinish = async (v: CreateBrigadePayload) => {
    try {
      const created = await mutation.mutateAsync(v);
      message.success('Бригада создана');
      form.resetFields();
      onCreated?.(created);
      onClose();
    } catch {
      message.error('Не удалось создать');
    }
  };

  return (
    <FormModal
      title="Новая бригада"
      subtitle="Бригада — устойчивая команда с прорабом и собственным мини-складом"
      open={open}
      onClose={onClose}
      width={640}
      dirty={dirty}
      onSubmit={() => form.submit()}
      footer={
        <Button
          type="primary"
          size="large"
          block
          loading={mutation.isPending}
          onClick={() => form.submit()}
        >
          Создать бригаду
        </Button>
      }
    >
      <Form<CreateBrigadePayload>
        form={form}
        layout="vertical"
        onFinish={onFinish}
        size="large"
        requiredMark="optional"
        style={{ padding: '20px 28px' }}
      >
        <Form.Item name="name" label="Название" rules={[{ required: true }]}>
          <Input placeholder="Бригада №1, Каменщики" autoFocus />
        </Form.Item>
        <Form.Item
          name="specialization"
          label="Специализация"
          tooltip="Можно оставить пустым"
        >
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
      </Form>
    </FormModal>
  );
}

export function CreateBrigadeButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
        Новая бригада
      </Button>
      <CreateBrigadeModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
