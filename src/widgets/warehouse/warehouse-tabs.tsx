'use client';

import { Tabs } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { BalancesTable } from './balances-table';
import { InventoryItemsTable } from './inventory-items-table';
import { ReservationsTable } from './reservations-table';
import { StockCountsTable } from './stock-counts-table';
import { TransactionsTable } from './transactions-table';
import { TransfersTable } from './transfers-table';
import { WarehousesTable } from './warehouses-table';
import { PurchaseOrdersTable } from '@widgets/purchases/purchase-orders-table';
import { SuppliersTable } from '@widgets/purchases/suppliers-table';

interface Props {
  /** Outer search query — only applied to the catalog tab where it makes sense. */
  search?: string;
  /** Show only items below their low-stock threshold (catalog tab). */
  lowStockOnly?: boolean;
  /**
   * If provided, scopes the tabs to a single project:
   *   - Catalog-style tabs (Поставщики / Склады) are hidden
   *   - "Движение" and "Закупки" filter by this projectId
   */
  projectId?: string;
  /**
   * Storage key for the URL tab query param. Defaults to `tab`. Set a
   * unique value when multiple WarehouseTabs instances coexist on one page.
   */
  urlKey?: string;
}

interface TabConfig {
  key: string;
  label: string;
  children: React.ReactNode;
}

/**
 * Shared warehouse tabs — same set of operational views used at the
 * company level (/warehouse) and on each object's warehouse tab
 * (/objects/[id]/warehouse). Project scope is signalled by the
 * `projectId` prop: catalog-only tabs collapse, scoped tabs filter.
 *
 * Active tab is synced to the URL via `?tab=<key>` (configurable via
 * `urlKey`) so links stay deep-linkable.
 */
export function WarehouseTabs({
  search,
  lowStockOnly,
  projectId,
  urlKey = 'tab',
}: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const items = useMemo<TabConfig[]>(() => {
    const all: TabConfig[] = [
      {
        key: 'items',
        label: 'Каталог',
        children: (
          <InventoryItemsTable search={search ?? ''} lowStockOnly={lowStockOnly ?? false} />
        ),
      },
      { key: 'balances',     label: 'Остатки',        children: <BalancesTable /> },
      { key: 'txns',         label: 'Движение',       children: <TransactionsTable projectId={projectId} /> },
      { key: 'transfers',    label: 'Перемещения',    children: <TransfersTable /> },
      { key: 'reservations', label: 'Резервы',        children: <ReservationsTable /> },
      { key: 'counts',       label: 'Инвентаризация', children: <StockCountsTable /> },
      { key: 'purchases',    label: 'Закупки',        children: <PurchaseOrdersTable projectId={projectId} /> },
    ];
    // Catalog-only tabs — drop them in object scope, they don't belong
    // to a single project.
    if (!projectId) {
      all.push({ key: 'suppliers',  label: 'Поставщики', children: <SuppliersTable /> });
      all.push({ key: 'warehouses', label: 'Склады',     children: <WarehousesTable /> });
    }
    return all;
  }, [search, lowStockOnly, projectId]);

  const activeKey = useMemo(() => {
    const fromUrl = params.get(urlKey);
    if (fromUrl && items.some((t) => t.key === fromUrl)) return fromUrl;
    return items[0].key;
  }, [params, urlKey, items]);

  const handleChange = (key: string) => {
    const sp = new URLSearchParams(params.toString());
    if (key === items[0].key) sp.delete(urlKey);
    else sp.set(urlKey, key);
    const query = sp.toString();
    router.replace(query ? `?${query}` : '?', { scroll: false });
  };

  return (
    <Tabs
      activeKey={activeKey}
      onChange={handleChange}
      destroyInactiveTabPane
      items={items}
    />
  );
}
