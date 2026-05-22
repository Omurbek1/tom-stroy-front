'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from 'antd';

/**
 * Lazy wrappers for the warehouse table widgets. AntD `<Tabs>` only
 * mounts the active panel, but the entire JS for all 8 tables still
 * ships in the route bundle. Splitting each into its own chunk shaves
 * ~150-200KB off /warehouse and /objects/[id]/warehouse cold loads.
 *
 * SSR is off — every table fires client-side queries on mount; nothing
 * useful is server-rendered, so disabling SSR cuts the hydration cost.
 *
 * `next/dynamic` insists on an *inline* object-literal options bag —
 * compile-time rewriter inspects it — so we can't share a constant.
 */

const Loader = () => <Skeleton active paragraph={{ rows: 6 }} />;

export const BalancesTable = dynamic(
  () => import('./balances-table').then((m) => ({ default: m.BalancesTable })),
  { ssr: false, loading: Loader },
);

export const InventoryItemsTable = dynamic(
  () =>
    import('./inventory-items-table').then((m) => ({ default: m.InventoryItemsTable })),
  { ssr: false, loading: Loader },
);

export const ReservationsTable = dynamic(
  () => import('./reservations-table').then((m) => ({ default: m.ReservationsTable })),
  { ssr: false, loading: Loader },
);

export const StockCountsTable = dynamic(
  () => import('./stock-counts-table').then((m) => ({ default: m.StockCountsTable })),
  { ssr: false, loading: Loader },
);

export const TransactionsTable = dynamic(
  () => import('./transactions-table').then((m) => ({ default: m.TransactionsTable })),
  { ssr: false, loading: Loader },
);

export const TransfersTable = dynamic(
  () => import('./transfers-table').then((m) => ({ default: m.TransfersTable })),
  { ssr: false, loading: Loader },
);

export const WarehousesTable = dynamic(
  () => import('./warehouses-table').then((m) => ({ default: m.WarehousesTable })),
  { ssr: false, loading: Loader },
);

export const PurchaseOrdersTable = dynamic(
  () =>
    import('@widgets/purchases/purchase-orders-table').then((m) => ({
      default: m.PurchaseOrdersTable,
    })),
  { ssr: false, loading: Loader },
);

export const SuppliersTable = dynamic(
  () =>
    import('@widgets/purchases/suppliers-table').then((m) => ({
      default: m.SuppliersTable,
    })),
  { ssr: false, loading: Loader },
);
