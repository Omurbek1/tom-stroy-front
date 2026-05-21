'use client';

import { Button, DatePicker, Space, Tabs, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { PageHeader } from '@shared/ui/page-header';
import { VehiclesTable } from '@widgets/vehicles/vehicles-table';
import { UsagesTable } from '@widgets/vehicles/usages-table';
import { downloadFile } from '@shared/lib/download';
import { apiRoutes } from '@shared/api/routes';

export default function VehiclesPage() {
  const [range, setRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ]);
  const [downloading, setDownloading] = useState(false);

  const onExport = async () => {
    setDownloading(true);
    try {
      await downloadFile(
        apiRoutes.reports.vehiclesXlsx,
        {
          from: range[0].startOf('day').toISOString(),
          to: range[1].endOf('day').toISOString(),
        },
        'vehicles.xlsx',
      );
    } catch {
      message.error('Не удалось скачать файл');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Техника"
        subtitle="Парк и история использования"
        extra={
          <Space>
            <DatePicker.RangePicker
              value={range}
              onChange={(v) => v && setRange(v as [Dayjs, Dayjs])}
              format="DD.MM.YYYY"
              allowClear={false}
            />
            <Button icon={<DownloadOutlined />} onClick={onExport} loading={downloading}>
              Excel
            </Button>
          </Space>
        }
      />
      <Tabs
        defaultActiveKey="fleet"
        items={[
          { key: 'fleet', label: 'Парк', children: <VehiclesTable /> },
          { key: 'usages', label: 'Использование', children: <UsagesTable /> },
        ]}
      />
    </>
  );
}
