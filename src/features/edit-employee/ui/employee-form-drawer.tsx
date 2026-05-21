'use client';

import { Button, Col, Form, Input, InputNumber, Row, Select, Switch } from 'antd';
import { FormModal } from '@shared/ui/form-modal';
import { useFormDirty } from '@shared/hooks/use-form-dirty';
import { message } from '@shared/lib/antd-static';
import { useEffect } from 'react';
import { useCreateEmployee, useUpdateEmployee } from '@entities/employee/hooks';
import type { CreateEmployeePayload, Employee } from '@entities/employee/types';
import {
  EMPLOYEE_ROLE_OPTIONS,
  PAY_TYPE_OPTIONS,
} from '@shared/constants/employee-roles';

interface FormShape extends CreateEmployeePayload {
  isActive?: boolean;
}

interface Props {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
  onCreated?: (employee: Employee) => void;
}

export function EmployeeFormDrawer({ employee, open, onClose, onCreated }: Props) {
  const [form] = Form.useForm<FormShape>();
  const isEdit = !!employee;
  const create = useCreateEmployee();
  const update = useUpdateEmployee();
  const dirty = useFormDirty(form);

  useEffect(() => {
    if (open) {
      if (employee) {
        form.setFieldsValue({
          fullName: employee.fullName,
          phone: employee.phone ?? undefined,
          passportNo: employee.passportNo ?? undefined,
          role: employee.role,
          payType: employee.payType,
          rate: Number(employee.rate),
          isActive: employee.isActive,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ role: 'MASON', payType: 'PER_SHIFT', isActive: true });
      }
    }
  }, [open, employee, form]);

  const onFinish = async (v: FormShape) => {
    try {
      if (isEdit && employee) {
        await update.mutateAsync({ id: employee.id, payload: v });
        message.success('Сохранено');
      } else {
        const created = await create.mutateAsync(v);
        message.success('Сотрудник добавлен');
        onCreated?.(created);
      }
      onClose();
    } catch {
      message.error('Ошибка');
    }
  };

  const pending = create.isPending || update.isPending;

  return (
    <FormModal
      title={isEdit ? 'Редактировать сотрудника' : 'Новый сотрудник'}
      subtitle={
        isEdit
          ? 'Изменения вступят в силу сразу для всех объектов'
          : 'Заполните карточку — сотрудника можно сразу назначить в команду или бригаду'
      }
      open={open}
      onClose={onClose}
      width={760}
      dirty={dirty}
      onSubmit={() => form.submit()}
      footer={
        <Button type="primary" size="large" block loading={pending} onClick={() => form.submit()}>
          {isEdit ? 'Сохранить' : 'Создать сотрудника'}
        </Button>
      }
    >
      <Form<FormShape>
        form={form}
        layout="vertical"
        onFinish={onFinish}
        size="large"
        requiredMark="optional"
        style={{ padding: '20px 28px' }}
      >
        <Row gutter={20}>
          <Col span={24}>
            <Form.Item name="fullName" label="ФИО" rules={[{ required: true }]}>
              <Input placeholder="Иванов Иван Иванович" autoFocus />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="phone" label="Телефон">
              <Input placeholder="+996700..." />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="passportNo" label="Паспорт">
              <Input placeholder="AN1234567" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="role" label="Должность" rules={[{ required: true }]}>
              <Select options={EMPLOYEE_ROLE_OPTIONS} showSearch optionFilterProp="label" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="payType" label="Тип оплаты" rules={[{ required: true }]}>
              <Select options={PAY_TYPE_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={isEdit ? 12 : 24}>
            <Form.Item
              name="rate"
              label="Ставка"
              tooltip="За единицу выбранного типа оплаты"
              rules={[{ required: true }]}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                parser={(v) => Number(`${v}`.replace(/\s/g, '')) as 0}
                addonAfter="сом"
              />
            </Form.Item>
          </Col>
          {isEdit && (
            <Col span={12}>
              <Form.Item name="isActive" label="Активен" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          )}
        </Row>
      </Form>
    </FormModal>
  );
}
