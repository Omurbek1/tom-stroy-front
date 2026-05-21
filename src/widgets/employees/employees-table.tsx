'use client';

import { Button, Card, Tag } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { useEmployees } from '@entities/employee/hooks';
import type { Employee, EmployeeRole, PayType } from '@entities/employee/types';
import { DataTable } from '@shared/ui/data-table';
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

interface Props {
  search: string;
}

export function EmployeesTable({ search }: Props) {
  const { data, isLoading } = useEmployees(search || undefined);
  const [edit, setEdit] = useState<Employee | null>(null);

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
    <Card title="Сотрудники">
      <DataTable<Employee>
        rowKey="id"
        columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading}
        minWidth={960}
        scrollY={520}
        emptyTitle="Нет сотрудников"
        emptyDescription={search ? 'Попробуйте другой запрос' : 'Добавьте первого сотрудника'}
      />
      <EmployeeFormDrawer employee={edit} open={!!edit} onClose={() => setEdit(null)} />
    </Card>
  );
}
