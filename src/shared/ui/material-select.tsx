'use client';

import { Select, Tag } from 'antd';
import { useMemo, useState } from 'react';
import {
  useInventoryBalances,
  useInventoryItems,
} from '@entities/inventory-item/hooks';
import { formatNumber } from '@shared/lib/format';

export interface MaterialPickMeta {
  unit: string;
  /** Available qty at the relevant context (per-warehouse if `warehouseId`
   *  prop is set, otherwise the legacy global onHand). */
  onHand: number;
  costPrice: number;
}

interface Props {
  value?: string;
  onChange?: (id: string | undefined, meta?: MaterialPickMeta) => void;
  placeholder?: string;
  size?: 'small' | 'middle' | 'large';
  /**
   * Scope the dropdown to materials with a balance at this warehouse.
   * - When set: list = `/inventory/balances?warehouseId=…`, qty is the
   *   per-warehouse available stock, item not present at the warehouse
   *   is hidden from the dropdown.
   * - When unset: list = `/inventory/items` (global catalog) and qty is
   *   `onHand` (legacy, home-warehouse mirror). Use this for catalog
   *   pickers and contexts where the warehouse is unknown.
   *
   * The writeoff / transfer forms set this so the autocomplete and the
   * row's "Остаток" tag both read from the same per-warehouse source —
   * fixes the bug where the dropdown said "22 шт" but the row read 0.
   */
  warehouseId?: string;
}

export function MaterialSelect({
  value,
  onChange,
  placeholder,
  size,
  warehouseId,
}: Props) {
  const [search, setSearch] = useState('');
  const scoped = Boolean(warehouseId);

  // Two data sources, one selected via `scoped`:
  //   • useInventoryBalances → per-warehouse view (correct in writeoff /
  //     transfer)
  //   • useInventoryItems    → global catalog (correct for general
  //     pickers, daily reports, etc.)
  const balancesQ = useInventoryBalances(
    scoped ? { warehouseId, search: search || undefined, limit: 50 } : { limit: 0 },
  );
  const itemsQ = useInventoryItems(
    scoped ? { limit: 0 } : { search: search || undefined, limit: 50 },
  );

  const isLoading = scoped ? balancesQ.isLoading : itemsQ.isLoading;

  const options = useMemo(() => {
    if (scoped) {
      const rows = balancesQ.data?.data ?? [];
      return rows.map((b) => ({
        value: b.id,
        label: b.name,
        unit: b.unit,
        // `available` = qty − reserved, per-warehouse. This is what the
        // row tag reads from balanceByItem, so the dropdown matches.
        onHand: Number(b.available ?? b.qty),
        costPrice: Number(b.avgCost),
        minStock: Number(b.minStock),
      }));
    }
    const rows = itemsQ.data?.data ?? [];
    return rows.map((it) => ({
      value: it.id,
      label: it.name,
      unit: it.unit,
      onHand: it.onHand,
      costPrice: it.costPrice,
      minStock: it.minStock,
    }));
  }, [scoped, balancesQ.data, itemsQ.data]);

  return (
    <Select
      showSearch
      allowClear
      size={size}
      value={value}
      onChange={(id) => {
        const opt = options.find((o) => o.value === id);
        onChange?.(
          id,
          opt
            ? { unit: opt.unit, onHand: opt.onHand, costPrice: opt.costPrice }
            : undefined,
        );
      }}
      placeholder={
        placeholder ??
        (scoped ? 'Материал на этом складе' : 'Материал со склада')
      }
      loading={isLoading}
      filterOption={false}
      onSearch={setSearch}
      options={options}
      optionLabelProp="label"
      notFoundContent={
        scoped && !isLoading
          ? 'На этом складе нет материалов'
          : undefined
      }
      optionRender={(opt) => {
        const low = opt.data.onHand <= opt.data.minStock;
        const empty = opt.data.onHand <= 0;
        return (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {opt.data.label}
            </span>
            <Tag
              color={empty ? 'default' : low ? 'red' : 'blue'}
              style={{ margin: 0, fontSize: 'var(--font-size-2xs)' }}
            >
              {formatNumber(opt.data.onHand)} {opt.data.unit}
            </Tag>
          </div>
        );
      }}
    />
  );
}
