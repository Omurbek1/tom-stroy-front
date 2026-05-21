'use client';

import { Select } from 'antd';
import { useMemo } from 'react';
import { useProjectsList } from '@entities/project/hooks';

interface Props {
  value?: string;
  onChange?: (id: string | undefined) => void;
  placeholder?: string;
  size?: 'small' | 'middle' | 'large';
}

export function ProjectSelect({ value, onChange, placeholder, size }: Props) {
  const { data, isLoading } = useProjectsList({});

  const options = useMemo(
    () => (data?.data ?? []).map((p) => ({ value: p.id, label: p.name })),
    [data],
  );

  return (
    <Select
      showSearch
      allowClear
      size={size}
      value={value}
      onChange={onChange}
      placeholder={placeholder ?? 'Объект'}
      loading={isLoading}
      options={options}
      filterOption={(input, option) =>
        (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
      }
    />
  );
}
