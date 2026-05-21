'use client';

import { Select } from 'antd';
import { useMemo } from 'react';
import { useEmployees } from '@entities/employee/hooks';
import type { EmployeeRole } from '@entities/employee/types';

const ROLE_SHORT: Partial<Record<EmployeeRole, string>> = {
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
  WAREHOUSE: 'Склад',
  OTHER: 'Прочее',
};

interface Props {
  value?: string;
  onChange?: (id: string | undefined) => void;
  roleFilter?: EmployeeRole[];
  placeholder?: string;
  size?: 'small' | 'middle' | 'large';
}

export function EmployeeSelect({ value, onChange, roleFilter, placeholder, size }: Props) {
  const { data, isLoading } = useEmployees();

  const options = useMemo(() => {
    const rows = data?.data ?? [];
    return rows
      .filter((e) => e.isActive && (!roleFilter || roleFilter.includes(e.role)))
      .map((e) => ({
        value: e.id,
        label: e.fullName,
        roleShort: ROLE_SHORT[e.role] ?? e.role,
      }));
  }, [data, roleFilter]);

  return (
    <Select
      showSearch
      allowClear
      size={size}
      value={value}
      onChange={onChange}
      placeholder={placeholder ?? 'Выберите сотрудника'}
      loading={isLoading}
      filterOption={(input, option) =>
        (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ||
        (option?.roleShort as string)?.toLowerCase().includes(input.toLowerCase())
      }
      optionLabelProp="label"
      options={options}
      optionRender={(opt) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{opt.data.label}</span>
          <span style={{ color: '#8c8c8c', fontSize: 12 }}>{opt.data.roleShort}</span>
        </div>
      )}
    />
  );
}
