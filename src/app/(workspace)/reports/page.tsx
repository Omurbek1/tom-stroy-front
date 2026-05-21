'use client';

import { Button, Card, Col, DatePicker, Form, Row, Space, Typography } from 'antd';
import { message } from '@shared/lib/antd-static';
import { DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import { PageHeader } from '@shared/ui/page-header';
import { PageContainer } from '@shared/ui/page-container';
import { downloadFile } from '@shared/lib/download';
import { apiRoutes } from '@shared/api/routes';
import { FinanceSubnav } from '@widgets/finance/finance-subnav';

type ReportKind = 'payroll' | 'pnl' | 'vehicles';

interface FormShape {
  range: [Dayjs, Dayjs];
}

const REPORTS: { kind: ReportKind; title: string; description: string; url: string }[] = [
  {
    kind: 'payroll',
    title: 'Ведомость зарплат',
    description: 'XLSX со списком сотрудников: дни, часы, начисления за выбранный период.',
    url: apiRoutes.reports.payrollXlsx,
  },
  {
    kind: 'pnl',
    title: 'P&L компании',
    description:
      'Книга Excel с двумя листами: сводный P&L (доход / материалы / ФОТ / техника / прочее / прибыль) и разбивка по дням.',
    url: apiRoutes.reports.pnlXlsx,
  },
  {
    kind: 'vehicles',
    title: 'Использование техники',
    description: 'XLSX со списком VehicleUsage за период: часы, топливо, стоимость с итогами.',
    url: apiRoutes.reports.vehiclesXlsx,
  },
];

export default function ReportsPage() {
  const [form] = Form.useForm<FormShape>();
  const [busy, setBusy] = useState<ReportKind | null>(null);

  const download = async (kind: ReportKind, url: string) => {
    const range = form.getFieldValue('range') as [Dayjs, Dayjs] | undefined;
    if (!range?.[0] || !range?.[1]) {
      message.warning('Выберите период');
      return;
    }
    setBusy(kind);
    try {
      await downloadFile(
        url,
        {
          from: range[0].startOf('day').toISOString(),
          to: range[1].endOf('day').toISOString(),
        },
        `${kind}.xlsx`,
      );
    } catch {
      message.error('Не удалось скачать файл');
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Отчёты"
        subtitle="Excel-выгрузки для бухгалтерии и руководства"
      />
      <FinanceSubnav />
      <PageContainer>
        <Card title="Период">
          <Form<FormShape>
            form={form}
            layout="inline"
            initialValues={{ range: [dayjs().startOf('month'), dayjs().endOf('month')] }}
          >
            <Form.Item name="range" label="Диапазон дат">
              <DatePicker.RangePicker format="DD.MM.YYYY" />
            </Form.Item>
          </Form>
        </Card>

        <Row gutter={[16, 16]}>
          {REPORTS.map((r) => (
            <Col xs={24} md={8} key={r.kind}>
              <Card
                title={
                  <Space>
                    <FileExcelOutlined style={{ color: '#52c41a' }} />
                    {r.title}
                  </Space>
                }
              >
                <Typography.Paragraph type="secondary" style={{ minHeight: 64 }}>
                  {r.description}
                </Typography.Paragraph>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  loading={busy === r.kind}
                  onClick={() => download(r.kind, r.url)}
                  block
                >
                  Скачать
                </Button>
              </Card>
            </Col>
          ))}
        </Row>

        <Card title="Подсказки">
          <Typography.Paragraph type="secondary">
            • Расчётные листки (PDF) для отдельных сотрудников скачиваются со страницы
            «Зарплаты» → клик по строке закрытой ведомости → кнопка «Листок».
          </Typography.Paragraph>
          <Typography.Paragraph type="secondary">
            • PDF дневного отчёта прораба — с страницы объекта → таб «Отчёты прораба» →
            клик по строке → кнопка «PDF».
          </Typography.Paragraph>
          <Typography.Paragraph type="secondary">
            • P&L по конкретному объекту — со страницы объекта → таб «Финансы» → кнопка «P&L Excel».
          </Typography.Paragraph>
        </Card>
      </PageContainer>
    </>
  );
}
