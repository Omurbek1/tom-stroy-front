'use client';

import { Select } from 'antd';
import { useMemo } from 'react';
import { useWarehouses } from '@entities/warehouse/hooks';

interface Props {
  value?: string;
  onChange?: (id: string | undefined) => void;
  placeholder?: string;
  size?: 'small' | 'middle' | 'large';
  excludeId?: string;
}

export function WarehouseSelect({ value, onChange, placeholder, size, excludeId }: Props) {
  const { data, isLoading } = useWarehouses();

  const options = useMemo(
    () =>
      (data?.data ?? [])
        .filter((w) => w.id !== excludeId)
        .map((w) => ({ value: w.id, label: w.name })),
    [data, excludeId],
  );

  return (
    <Select
      showSearch
      allowClear
      size={size}
      value={value}
      onChange={onChange}
      placeholder={placeholder ?? 'Склад'}
      loading={isLoading}
      options={options}
      filterOption={(input, option) =>
        (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
      }
    />
  );
}
