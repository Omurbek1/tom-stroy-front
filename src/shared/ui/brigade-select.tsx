'use client';

import { Select } from 'antd';
import { useMemo } from 'react';
import { useBrigades } from '@entities/brigade/hooks';

interface Props {
  value?: string;
  onChange?: (id: string | undefined) => void;
  placeholder?: string;
  size?: 'small' | 'middle' | 'large';
}

export function BrigadeSelect({ value, onChange, placeholder, size }: Props) {
  const { data, isLoading } = useBrigades();

  const options = useMemo(
    () => (data?.data ?? []).map((b) => ({ value: b.id, label: b.name })),
    [data],
  );

  return (
    <Select
      showSearch
      allowClear
      size={size}
      value={value}
      onChange={onChange}
      placeholder={placeholder ?? 'Бригада'}
      loading={isLoading}
      options={options}
      filterOption={(input, option) =>
        (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
      }
    />
  );
}
