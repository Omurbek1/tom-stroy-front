'use client';

import { Select } from 'antd';
import { useMemo, useState } from 'react';
import { useSuppliers } from '@entities/supplier/hooks';

interface Props {
  value?: string;
  onChange?: (id: string | undefined) => void;
  placeholder?: string;
  size?: 'small' | 'middle' | 'large';
}

export function SupplierSelect({ value, onChange, placeholder, size }: Props) {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useSuppliers({ search: search || undefined, limit: 100 });

  const options = useMemo(
    () =>
      (data?.data ?? [])
        .filter((s) => s.isActive)
        .map((s) => ({ value: s.id, label: s.name, inn: s.inn })),
    [data],
  );

  return (
    <Select
      showSearch
      allowClear
      size={size}
      value={value}
      onChange={onChange}
      placeholder={placeholder ?? 'Поставщик'}
      loading={isLoading}
      filterOption={false}
      onSearch={setSearch}
      options={options}
      optionLabelProp="label"
      optionRender={(opt) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <span>{opt.data.label}</span>
          {opt.data.inn && (
            <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
              ИНН {opt.data.inn}
            </span>
          )}
        </div>
      )}
    />
  );
}
