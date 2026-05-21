'use client';

import { Select, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { useInventoryItems } from '@entities/inventory-item/hooks';
import { formatNumber } from '@shared/lib/format';

interface Props {
  value?: string;
  onChange?: (id: string | undefined, item?: { unit: string; onHand: number; costPrice: number }) => void;
  placeholder?: string;
  size?: 'small' | 'middle' | 'large';
}

export function MaterialSelect({ value, onChange, placeholder, size }: Props) {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useInventoryItems({ search: search || undefined, limit: 50 });

  const items = data?.data ?? [];

  const options = useMemo(
    () =>
      items.map((it) => ({
        value: it.id,
        label: it.name,
        unit: it.unit,
        onHand: it.onHand,
        costPrice: it.costPrice,
        minStock: it.minStock,
      })),
    [items],
  );

  return (
    <Select
      showSearch
      allowClear
      size={size}
      value={value}
      onChange={(id) => {
        const item = items.find((it) => it.id === id);
        onChange?.(id, item ? { unit: item.unit, onHand: item.onHand, costPrice: item.costPrice } : undefined);
      }}
      placeholder={placeholder ?? 'Материал со склада'}
      loading={isLoading}
      filterOption={false}
      onSearch={setSearch}
      options={options}
      optionLabelProp="label"
      optionRender={(opt) => {
        const low = opt.data.onHand <= opt.data.minStock;
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {opt.data.label}
            </span>
            <Tag color={low ? 'red' : 'blue'} style={{ margin: 0, fontSize: 'var(--font-size-2xs)' }}>
              {formatNumber(opt.data.onHand)} {opt.data.unit}
            </Tag>
          </div>
        );
      }}
    />
  );
}
