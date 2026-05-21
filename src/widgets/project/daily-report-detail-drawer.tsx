'use client';

import {
  Button,
  Descriptions,
  Drawer,
  Divider,
  Empty,
  Image,
  Skeleton,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';
import { useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { useDailyReport } from '@entities/daily-report/hooks';
import type {
  DailyReportAttendanceRow,
  DailyReportPhoto,
  DailyReportWorkRow,
} from '@entities/daily-report/types';
import { formatDate, formatMoney, formatNumber } from '@shared/lib/format';
import { downloadFile } from '@shared/lib/download';
import { apiRoutes } from '@shared/api/routes';

const workColumns: ColumnsType<DailyReportWorkRow> = [
  { title: 'Тип', dataIndex: 'workType', key: 'workType' },
  {
    title: 'Объём',
    key: 'volume',
    align: 'right',
    render: (_, r) => `${formatNumber(r.volume)} ${r.unit}`,
  },
  {
    title: 'Цена',
    dataIndex: 'price',
    key: 'price',
    align: 'right',
    render: (v: number) => formatMoney(v),
  },
  {
    title: 'Сумма',
    dataIndex: 'amount',
    key: 'amount',
    align: 'right',
    render: (v: number) => <strong>{formatMoney(v)}</strong>,
  },
  {
    title: 'Исполнитель',
    key: 'employee',
    render: (_, r) => r.employee?.fullName ?? '—',
  },
];

const attendanceColumns: ColumnsType<DailyReportAttendanceRow> = [
  {
    title: 'Сотрудник',
    key: 'employee',
    render: (_, r) => r.employee?.fullName ?? '—',
  },
  {
    title: 'Часы',
    dataIndex: 'hours',
    key: 'hours',
    align: 'right',
    width: 100,
    render: (v: number) => formatNumber(v),
  },
  {
    title: 'Статус',
    dataIndex: 'status',
    key: 'status',
    render: (s: string) => <Tag>{s}</Tag>,
  },
];

function PhotoGroup({ title, photos }: { title: string; photos: DailyReportPhoto[] }) {
  if (photos.length === 0) return null;
  return (
    <div>
      <Typography.Text strong>{title}</Typography.Text>
      <Image.PreviewGroup>
        <div className="flex flex-wrap gap-2 mt-2">
          {photos.map((p) => (
            <Image
              key={p.id}
              src={p.previewUrl}
              alt={p.kind}
              width={140}
              height={140}
              style={{ objectFit: 'cover', borderRadius: 6 }}
            />
          ))}
        </div>
      </Image.PreviewGroup>
    </div>
  );
}

interface Props {
  reportId: string | undefined;
  open: boolean;
  onClose: () => void;
}

export function DailyReportDetailDrawer({ reportId, open, onClose }: Props) {
  const { data: report, isLoading } = useDailyReport(open ? reportId : undefined);
  const [downloading, setDownloading] = useState(false);

  const before = report?.photos.filter((p) => p.kind === 'before') ?? [];
  const after = report?.photos.filter((p) => p.kind === 'after') ?? [];

  const onDownloadPdf = async () => {
    if (!reportId) return;
    setDownloading(true);
    try {
      await downloadFile(apiRoutes.dailyReports.pdf(reportId), {}, `daily-report-${reportId}.pdf`);
    } catch {
      message.error('Не удалось скачать PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Drawer
      title="Отчёт прораба"
      width={820}
      open={open}
      onClose={onClose}
      destroyOnHidden
      extra={
        <Button
          icon={<FilePdfOutlined />}
          onClick={onDownloadPdf}
          loading={downloading}
          disabled={!report}
        >
          PDF
        </Button>
      }
    >
      {isLoading || !report ? (
        <Skeleton active />
      ) : (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Descriptions column={{ xs: 1, sm: 2 }} size="small">
            <Descriptions.Item label="Дата">{formatDate(report.date)}</Descriptions.Item>
            <Descriptions.Item label="Статус">{report.status}</Descriptions.Item>
            <Descriptions.Item label="Прораб">{report.foreman?.fullName ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Бригада">{report.brigade?.name ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Что сделали" span={2}>
              {report.summary ?? '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Проблемы" span={2}>
              {report.problems ?? '—'}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left" style={{ marginTop: 0 }}>Работы</Divider>
          {report.works.length === 0 ? (
            <Empty description="Нет работ" />
          ) : (
            <Table<DailyReportWorkRow>
              rowKey="id"
              size="small"
              columns={workColumns}
              dataSource={report.works}
              pagination={false}
            />
          )}

          <Divider orientation="left">Посещаемость</Divider>
          {report.attendance.length === 0 ? (
            <Empty description="Нет данных" />
          ) : (
            <Table<DailyReportAttendanceRow>
              rowKey="id"
              size="small"
              columns={attendanceColumns}
              dataSource={report.attendance}
              pagination={false}
            />
          )}

          <Divider orientation="left">Фото</Divider>
          {report.photos.length === 0 ? (
            <Empty description="Нет фото" />
          ) : (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <PhotoGroup title="До работы" photos={before} />
              <PhotoGroup title="После работы" photos={after} />
            </Space>
          )}
        </Space>
      )}
    </Drawer>
  );
}
