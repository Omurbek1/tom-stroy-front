'use client';

import { use, useState } from 'react';
import { Card, Empty, Skeleton, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PageMeta } from '@shared/ui/page-meta';
import { PageContainer } from '@shared/ui/page-container';
import { useProject, useProjectBrigades } from '@entities/project/hooks';
import type { ProjectBrigadeRow } from '@entities/project/api';
import { formatDate, formatMoney, formatNumber } from '@shared/lib/format';
import { BrigadeDetailDrawer } from '@widgets/brigades/brigade-detail-drawer';

/**
 * Brigades that have worked on this specific object. Aggregated from
 * DailyReport / ProjectWork history (no explicit ProjectBrigade table
 * yet — would be Sprint M1). Per brigade we show: how much they earned
 * on this object, last visit, total daily-report count, members.
 */
export default function ObjectBrigadesPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const { data: project } = useProject(id);
  const { data, isLoading } = useProjectBrigades(id);
  const [openBrigadeId, setOpenBrigadeId] = useState<string | null>(null);

  const columns: ColumnsType<ProjectBrigadeRow> = [
    {
      title: 'Бригада',
      dataIndex: 'name',
      key: 'name',
      render: (v: string, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{v}</div>
          {r.specialization && (
            <div
              style={{
                fontSize: 12,
                color: 'var(--ant-color-text-secondary, #8c8c8c)',
              }}
            >
              {r.specialization}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Прораб',
      key: 'foreman',
      width: 200,
      render: (_, r) => r.foreman?.fullName ?? '—',
    },
    {
      title: 'Работ',
      key: 'works',
      width: 120,
      align: 'right',
      render: (_, r) => r.workBreakdown.reduce((s, w) => s + w.rowsCount, 0),
    },
    {
      title: 'Объём',
      key: 'volume',
      width: 130,
      align: 'right',
      render: (_, r) => formatNumber(r.workBreakdown.reduce((s, w) => s + w.volume, 0)),
    },
    {
      title: 'Отчётов',
      dataIndex: 'reportsCount',
      key: 'reportsCount',
      width: 110,
      align: 'right',
    },
    {
      title: 'Последний визит',
      dataIndex: 'lastVisit',
      key: 'lastVisit',
      width: 150,
      render: (v: string | null) => (v ? formatDate(v) : '—'),
    },
    {
      title: 'Начислено за работы',
      dataIndex: 'totalEarned',
      key: 'totalEarned',
      width: 180,
      align: 'right',
      sorter: (a, b) => a.totalEarned - b.totalEarned,
      defaultSortOrder: 'descend',
      render: (v: number) => (
        <Tag color={v > 0 ? 'green' : 'default'}>
          <strong>{formatMoney(v)}</strong>
        </Tag>
      ),
    },
    {
      title: 'Выплачено',
      dataIndex: 'payrollPaid',
      key: 'payrollPaid',
      width: 150,
      align: 'right',
      render: (v: number) => formatMoney(v),
    },
    {
      title: 'Остаток',
      dataIndex: 'objectBalance',
      key: 'objectBalance',
      width: 150,
      align: 'right',
      render: (v: number) => (
        <strong style={{ color: v > 0 ? 'var(--finance-expense)' : 'var(--finance-income)' }}>
          {formatMoney(v)}
        </strong>
      ),
    },
  ];

  const breakdownColumns: ColumnsType<ProjectBrigadeRow['workBreakdown'][number]> = [
    { title: 'Вид работ', dataIndex: 'workType', key: 'workType' },
    {
      title: 'Объём',
      key: 'volume',
      align: 'right',
      width: 150,
      render: (_, r) => `${formatNumber(r.volume)} ${r.unit}`,
    },
    {
      title: 'Строк',
      dataIndex: 'rowsCount',
      key: 'rowsCount',
      align: 'right',
      width: 100,
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      width: 160,
      render: (v: number) => <strong>{formatMoney(v)}</strong>,
    },
  ];

  return (
    <>
      <PageMeta
        title="Бригады на объекте"
        subtitle="Кто работал на этом объекте, сколько отчётов и заработка"
        breadcrumbs={[
          { href: '/objects', label: 'Объекты' },
          { href: `/objects/${id}`, label: project?.name ?? 'Объект' },
          { label: 'Бригады' },
        ]}
      />
      <PageContainer>
        <Card>
          {isLoading ? (
            <Skeleton active />
          ) : !data || data.length === 0 ? (
            <Empty description="Ни одна бригада ещё не работала на этом объекте. Бригады появятся здесь после первого отчёта прораба." />
          ) : (
            <Table<ProjectBrigadeRow>
              rowKey="id"
              size="small"
              columns={columns}
              dataSource={data}
              pagination={false}
              scroll={{ x: 1200 }}
              expandable={{
                expandedRowRender: (record) => (
                  <Table<ProjectBrigadeRow['workBreakdown'][number]>
                    rowKey={(row) => `${row.workType}-${row.unit}`}
                    size="small"
                    columns={breakdownColumns}
                    dataSource={record.workBreakdown}
                    pagination={false}
                  />
                ),
                rowExpandable: (record) => record.workBreakdown.length > 0,
              }}
              onRow={(record) => ({
                onClick: () => setOpenBrigadeId(record.id),
                style: { cursor: 'pointer' },
              })}
            />
          )}
        </Card>
        <BrigadeDetailDrawer
          brigadeId={openBrigadeId}
          open={openBrigadeId !== null}
          onClose={() => setOpenBrigadeId(null)}
        />
      </PageContainer>
    </>
  );
}
