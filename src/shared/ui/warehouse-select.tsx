'use client';

import { Select, Tag } from 'antd';
import { useMemo } from 'react';
import { useWarehouses, type WarehouseKind } from '@entities/warehouse/hooks';

interface Props {
  value?: string;
  onChange?: (id: string | undefined) => void;
  placeholder?: string;
  size?: 'small' | 'middle' | 'large';
  excludeId?: string;
  /**
   * Filter by warehouse kinds. Default = MAIN+PROJECT+TEMP (personal
   * brigade warehouses are hidden unless explicitly requested via
   * `includeBrigade` or by setting `kinds` to include `BRIGADE`).
   */
  kinds?: WarehouseKind[];
  /** Shortcut to include personal brigade warehouses in the dropdown. */
  includeBrigade?: boolean;
}

const DEFAULT_KINDS: WarehouseKind[] = ['MAIN', 'PROJECT', 'TEMP'];

const KIND_TAG: Record<WarehouseKind, { label: string; color: string }> = {
  MAIN: { label: 'Главный', color: 'blue' },
  PROJECT: { label: 'Объект', color: 'green' },
  BRIGADE: { label: 'Бригада', color: 'purple' },
  TEMP: { label: 'Транзит', color: 'default' },
};

export function WarehouseSelect({
  value,
  onChange,
  placeholder,
  size,
  excludeId,
  kinds,
  includeBrigade,
}: Props) {
  const { data, isLoading } = useWarehouses();

  const allowedKinds = useMemo<WarehouseKind[]>(() => {
    if (kinds && kinds.length > 0) return kinds;
    if (includeBrigade) return [...DEFAULT_KINDS, 'BRIGADE'];
    return DEFAULT_KINDS;
  }, [kinds, includeBrigade]);

  const options = useMemo(
    () =>
      (data?.data ?? [])
        .filter((w) => w.id !== excludeId)
        .filter((w) => allowedKinds.includes((w.kind ?? 'MAIN') as WarehouseKind))
        .map((w) => ({
          value: w.id,
          label: w.name,
          kind: (w.kind ?? 'MAIN') as WarehouseKind,
        })),
    [data, excludeId, allowedKinds],
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
      optionLabelProp="label"
      optionRender={(opt) => {
        const meta = KIND_TAG[opt.data.kind as WarehouseKind] ?? KIND_TAG.MAIN;
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <span>{opt.data.label}</span>
            <Tag color={meta.color} style={{ margin: 0, fontSize: 11 }}>
              {meta.label}
            </Tag>
          </div>
        );
      }}
    />
  );
}
