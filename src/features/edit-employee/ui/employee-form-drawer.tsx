'use client';

import { Button, Drawer, Form, Input, InputNumber, Select, Switch } from 'antd';
import { message } from '@shared/lib/antd-static';
import { useEffect } from 'react';
import { useCreateEmployee, useUpdateEmployee } from '@entities/employee/hooks';
import type {
  CreateEmployeePayload,
  Employee,
  EmployeeRole,
  PayType,
} from '@entities/employee/types';

const ROLE_OPTIONS: { value: EmployeeRole; label: string }[] = [
  { value: 'FOREMAN', label: 'Прораб' },
  { value: 'MASON', label: 'Каменщик' },
  { value: 'CONCRETE', label: 'Бетонщик' },
  { value: 'PLASTERER', label: 'Штукатур' },
  { value: 'PLUMBER', label: 'Сантехник' },
  { value: 'ELECTRICIAN', label: 'Электрик' },
  { value: 'WELDER', label: 'Сварщик' },
  { value: 'ROOFER', label: 'Кровельщик' },
  { value: 'DRIVER', label: 'Водитель' },
  { value: 'OPERATOR', label: 'Оператор техники' },
  { value: 'LABORER', label: 'Разнорабочий' },
  { value: 'FINISHER', label: 'Отделочник' },
  { value: 'WAREHOUSE', label: 'Кладовщик' },
  { value: 'OTHER', label: 'Прочее' },
];

const PAY_OPTIONS: { value: PayType; label: string }[] = [
  { value: 'PER_CUBE', label: 'За куб (м³)' },
  { value: 'PER_SQM', label: 'За м²' },
  { value: 'PER_METER', label: 'За пог. м' },
  { value: 'PER_SHIFT', label: 'За смену' },
  { value: 'HOURLY', label: 'Почасовая' },
  { value: 'SALARY', label: 'Оклад' },
  { value: 'SALARY_PLUS_PERCENT', label: 'Оклад + %' },
];

interface FormShape extends CreateEmployeePayload {
  isActive?: boolean;
}

interface Props {
  employee: Employee | null;
  open: boolean;
  onClose: () => void;
}

export function EmployeeFormDrawer({ employee, open, onClose }: Props) {
  const [form] = Form.useForm<FormShape>();
  const isEdit = !!employee;
  const create = useCreateEmployee();
  const update = useUpdateEmployee();

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
        await create.mutateAsync(v);
        message.success('Сотрудник добавлен');
      }
      onClose();
    } catch {
      message.error('Ошибка');
    }
  };

  return (
    <Drawer
      title={isEdit ? 'Редактировать сотрудника' : 'Новый сотрудник'}
      open={open}
      onClose={onClose}
      width={460}
      destroyOnHidden
    >
      <Form<FormShape> form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="fullName" label="ФИО" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="Телефон">
          <Input placeholder="+996700..." />
        </Form.Item>
        <Form.Item name="passportNo" label="Паспорт">
          <Input />
        </Form.Item>
        <Form.Item name="role" label="Должность" rules={[{ required: true }]}>
          <Select options={ROLE_OPTIONS} showSearch optionFilterProp="label" />
        </Form.Item>
        <Form.Item name="payType" label="Тип оплаты" rules={[{ required: true }]}>
          <Select options={PAY_OPTIONS} />
        </Form.Item>
        <Form.Item
          name="rate"
          label="Ставка (за единицу payType)"
          rules={[{ required: true }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        {isEdit && (
          <Form.Item name="isActive" label="Активен" valuePropName="checked">
            <Switch />
          </Form.Item>
        )}
        <Button
          type="primary"
          htmlType="submit"
          loading={create.isPending || update.isPending}
          block
        >
          {isEdit ? 'Сохранить' : 'Создать'}
        </Button>
      </Form>
    </Drawer>
  );
}
