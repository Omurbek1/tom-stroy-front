'use client';

import { Button, DatePicker, Popconfirm, Space } from 'antd';
import { DownloadOutlined, LockOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { message } from '@shared/lib/antd-static';
import { PageHeader } from '@shared/ui/page-header';
import { PageContainer } from '@shared/ui/page-container';
import { PageToolbar } from '@shared/ui/page-toolbar';
import { useClosePeriod, usePayrollPreview } from '@entities/payroll/hooks';
import { PayrollTable } from '@widgets/payroll/payroll-table';
import { ClosedPayrollsTable } from '@widgets/payroll/closed-payrolls-table';
import { downloadFile } from '@shared/lib/download';
import { apiRoutes } from '@shared/api/routes';

export default function PayrollPage() {
  const [range, setRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ]);
  const [downloading, setDownloading] = useState(false);

  const from = range[0].startOf('day').toISOString();
  const to = range[1].endOf('day').toISOString();

  const { data, isLoading } = usePayrollPreview({ from, to });
  const rows = data ?? [];
  const closeMutation = useClosePeriod();

  const onExport = async () => {
    setDownloading(true);
    try {
      await downloadFile(apiRoutes.reports.payrollXlsx, { from, to }, 'payroll.xlsx');
    } catch {
      message.error('Не удалось скачать файл');
    } finally {
      setDownloading(false);
    }
  };

  const onClose = async () => {
    try {
      const res = await closeMutation.mutateAsync({ from, to });
      message.success(`Закрыто записей: ${res.closed}`);
    } catch {
      message.error('Не удалось закрыть период');
    }
  };

  return (
    <>
      <PageHeader title="Зарплаты" subtitle="Предпросмотр и закрытые ведомости" />
      <PageToolbar
        dateRange={
          <DatePicker.RangePicker
            value={range}
            onChange={(v) => v && setRange(v as [Dayjs, Dayjs])}
            format="DD.MM.YYYY"
            allowClear={false}
          />
        }
        actions={
          <Space>
            <Button icon={<DownloadOutlined />} onClick={onExport} loading={downloading}>
              Excel
            </Button>
            <Popconfirm
              title="Закрыть период?"
              description="Будут созданы ведомости для всех сотрудников с начислениями за выбранный диапазон."
              okText="Закрыть"
              cancelText="Отмена"
              onConfirm={onClose}
            >
              <Button
                type="primary"
                icon={<LockOutlined />}
                loading={closeMutation.isPending}
                disabled={rows.length === 0}
              >
                Закрыть период
              </Button>
            </Popconfirm>
          </Space>
        }
      />
      <PageContainer>
        <PayrollTable rows={rows} isLoading={isLoading} />
        <ClosedPayrollsTable />
      </PageContainer>
    </>
  );
}
