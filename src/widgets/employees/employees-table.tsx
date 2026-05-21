'use client';

import { Button, Card, Input, Space, Table, Tag } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { useEmployees } from '@entities/employee/hooks';
import type { Employee, EmployeeRole, PayType } from '@entities/employee/types';
import { formatMoney } from '@shared/lib/format';
import { EmployeeFormDrawer } from '@features/edit-employee/ui/employee-form-drawer';

const ROLE_LABEL: Record<EmployeeRole, string> = {
  FOREMAN: 'Прораб',
  MASON: 'Каменщик',
  CONCRETE: 'Бетонщик',
  PLASTERER: 'Штукатур',
  PLUMBER: 'Сантехник',
  ELECTRICIAN: 'Электрик',
  WELDER: 'Сварщик',
  ROOFER: 'Кровельщик',
  DRIVER: 'Водитель',
  OPERATOR: 'Оператор',
  LABORER: 'Разнорабочий',
  FINISHER: 'Отделочник',
  WAREHOUSE: 'Кладовщик',
  OTHER: 'Прочее',
};

const PAY_LABEL: Record<PayType, string> = {
  PER_CUBE: 'За м³',
  PER_SQM: 'За м²',
  PER_METER: 'За м',
  PER_SHIFT: 'За смену',
  HOURLY: 'Почасовая',
  SALARY: 'Оклад',
  SALARY_PLUS_PERCENT: 'Оклад + %',
};

export function EmployeesTable() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useEmployees(search || undefined);
  const [edit, setEdit] = useState<Employee | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const columns: ColumnsType<Employee> = [
    { title: 'ФИО', dataIndex: 'fullName', key: 'fullName' },
    {
      title: 'Должность',
      dataIndex: 'role',
      key: 'role',
      render: (r: EmployeeRole) => <Tag>{ROLE_LABEL[r] ?? r}</Tag>,
    },
    {
      title: 'Тип оплаты',
      dataIndex: 'payType',
      key: 'payType',
      render: (p: PayType) => PAY_LABEL[p] ?? p,
    },
    {
      title: 'Ставка',
      dataIndex: 'rate',
      key: 'rate',
      align: 'right',
      width: 140,
      render: (v: number) => formatMoney(v),
    },
    { title: 'Телефон', dataIndex: 'phone', key: 'phone', render: (v) => v ?? '—' },
    {
      title: 'Статус',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (v: boolean) =>
        v ? <Tag color="green">Активен</Tag> : <Tag color="default">Уволен</Tag>,
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, r) => (
        <Button
          size="small"
          type="text"
          icon={<EditOutlined />}
          onClick={() => setEdit(r)}
        />
      ),
    },
  ];

  return (
    <Card
      title="Сотрудники"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          Новый сотрудник
        </Button>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Input.Search
          placeholder="Поиск по ФИО"
          allowClear
          onSearch={setSearch}
          style={{ maxWidth: 360 }}
        />
        <Table<Employee>
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={data?.data ?? []}
          loading={isLoading}
          pagination={false}
          sticky
        />
      </Space>
      <EmployeeFormDrawer
        employee={null}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <EmployeeFormDrawer employee={edit} open={!!edit} onClose={() => setEdit(null)} />
    </Card>
  );
}
