'use client';

import { Empty, Table } from 'antd';
import type { TableProps } from 'antd';
import type { AnyObject } from 'antd/es/_util/type';
import { ReactNode } from 'react';

interface Props<T extends AnyObject> extends Omit<TableProps<T>, 'dataSource' | 'columns'> {
  columns: NonNullable<TableProps<T>['columns']>;
  dataSource: T[];
  /**
   * Required minimal width — passed to `scroll.x`. Always provide a number
   * (not 'max-content') so the table virtualises predictably and so it
   * never breaks the parent grid column.
   */
  minWidth: number;
  /**
   * Виртуализация активируется автоматически когда `dataSource.length`
   * превышает `virtualThreshold`. Требует `scroll.y` — задавайте через
   * проп `scrollY`.
   */
  virtualThreshold?: number;
  scrollY?: number;
  emptyTitle?: string;
  emptyDescription?: ReactNode;
}

/**
 * Single entry point for tabular data:
 *   - `.table-shell` wraps horizontal scroll so the sidebar never moves.
 *   - Auto-virtualises long lists.
 *   - Consistent empty state.
 *   - Sticky header + small size by default.
 */
export function DataTable<T extends AnyObject>({
  columns,
  dataSource,
  minWidth,
  virtualThreshold = 200,
  scrollY,
  emptyTitle = 'Нет данных',
  emptyDescription,
  ...rest
}: Props<T>) {
  const shouldVirtualize = scrollY != null && dataSource.length > virtualThreshold;

  return (
    <div className="table-shell">
      <Table<T>
        size="small"
        sticky
        pagination={false}
        {...rest}
        columns={columns}
        dataSource={dataSource}
        virtual={shouldVirtualize || undefined}
        scroll={{ x: minWidth, ...(scrollY != null && { y: scrollY }) }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <div style={{ fontWeight: 500 }}>{emptyTitle}</div>
                  {emptyDescription && (
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      {emptyDescription}
                    </div>
                  )}
                </div>
              }
            />
          ),
        }}
      />
    </div>
  );
}
