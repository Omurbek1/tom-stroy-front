'use client';

import { useMemo, useState } from 'react';
import { Button, DatePicker, Form, InputNumber, Input, Select } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { message } from '@shared/lib/antd-static';
import { FormModal } from '@shared/ui/form-modal';
import { useFormDirty } from '@shared/hooks/use-form-dirty';
import { useCreateExpense } from '@entities/expense/hooks';
import { useProjectMembers } from '@entities/project-member/hooks';

interface FormShape {
  date: Dayjs;
  employeeId: string;
  amount: number;
  method: 'cash' | 'bank' | 'card';
  note?: string;
}

const METHOD_OPTIONS = [
  { value: 'cash', label: 'Наличными' },
  { value: 'bank', label: 'На карту / банк' },
  { value: 'card', label: 'Корпоративной картой' },
];

interface Props {
  projectId: string;
}

/**
 * Quick action: «Выдать аванс». Создаёт Expense(SALARY, PROJECT),
 * заводя его в P&L объекта сразу. Закрытие периода зарплат позже
 * сверит этот аванс с расчётом.
 */
export function IssueAdvanceButton({ projectId }: Props) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<FormShape>();
  const dirty = useFormDirty(form);
  const create = useCreateExpense();
  const { data: members, isLoading: membersLoading } = useProjectMembers(projectId);

  const employeeOptions = useMemo(
    () =>
      (members ?? []).map((m) => ({
        value: m.employeeId,
        label: m.employee.fullName,
        role: m.role,
      })),
    [members],
  );

  const onFinish = async (v: FormShape) => {
    const employee = members?.find((m) => m.employeeId === v.employeeId);
    const name = employee?.employee.fullName ?? 'сотруднику';
    const methodLabel =
      METHOD_OPTIONS.find((o) => o.value === v.method)?.label.toLowerCase() ?? v.method;
    try {
      await create.mutateAsync({
        date: v.date.toISOString(),
        scope: 'PROJECT',
        projectId,
        category: 'SALARY',
        amount: v.amount,
        comment: `Аванс ${name} (${methodLabel})${v.note ? '. ' + v.note : ''}`,
      });
      message.success(`Аванс выдан: ${name}`);
      form.resetFields();
      setOpen(false);
    } catch {
      message.error('Не удалось выдать аванс');
    }
  };

  return (
    <>
      <Button icon={<DollarOutlined />} onClick={() => setOpen(true)}>
        Выдать аванс
      </Button>
      <FormModal
        title="Выдача аванса"
        subtitle="Деньги, выданные сотруднику до закрытия зарплатного периода. Сразу попадают в P&L объекта."
        open={open}
        onClose={() => setOpen(false)}
        width={640}
        dirty={dirty}
        onSubmit={() => form.submit()}
        footer={
          <Button
            type="primary"
            size="large"
            block
            loading={create.isPending}
            onClick={() => form.submit()}
          >
            Выдать аванс
          </Button>
        }
      >
        <Form<FormShape>
          form={form}
          layout="vertical"
          size="large"
          requiredMark="optional"
          onFinish={onFinish}
          initialValues={{ date: dayjs(), method: 'cash' }}
          style={{ padding: '20px 28px' }}
        >
          <Form.Item
            name="employeeId"
            label="Кому"
            rules={[{ required: true, message: 'Выберите сотрудника из команды объекта' }]}
            tooltip="Список ограничен текущей командой объекта"
          >
            <Select
              showSearch
              loading={membersLoading}
              placeholder={
                employeeOptions.length === 0
                  ? 'Сначала добавьте сотрудников в команду'
                  : 'Выберите сотрудника'
              }
              optionFilterProp="label"
              options={employeeOptions}
              disabled={employeeOptions.length === 0}
            />
          </Form.Item>
          <Form.Item name="date" label="Дата выдачи" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
          <Form.Item
            name="amount"
            label="Сумма"
            rules={[{ required: true, message: 'Введите сумму' }]}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
              parser={(v) => Number(`${v}`.replace(/\s/g, '')) as 1}
              addonAfter="сом"
            />
          </Form.Item>
          <Form.Item name="method" label="Способ" rules={[{ required: true }]}>
            <Select options={METHOD_OPTIONS} />
          </Form.Item>
          <Form.Item name="note" label="Примечание">
            <Input.TextArea rows={2} placeholder="Например: на стройматериалы / личное" />
          </Form.Item>
        </Form>
      </FormModal>
    </>
  );
}
