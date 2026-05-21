'use client';

import {
  Button,
  Col,
  Descriptions,
  Drawer,
  Divider,
  Empty,
  Progress,
  Row,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
  message,
} from 'antd';
import { DollarOutlined, FilePdfOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import { usePayroll } from '@entities/payroll/hooks';
import type { PayrollLine, PaymentRow, PayrollLineKind } from '@entities/payroll/types';
import { formatDate, formatMoney } from '@shared/lib/format';
import { downloadFile } from '@shared/lib/download';
import { apiRoutes } from '@shared/api/routes';
import { PayrollLineDrawer } from './payroll-line-drawer';
import { PaymentDrawer } from './payment-drawer';

const LINE_LABEL: Record<PayrollLineKind, string> = {
  advance: 'Аванс',
  fine: 'Штраф',
  bonus: 'Премия',
  deduction: 'Удержание',
};

const LINE_COLOR: Record<PayrollLineKind, string> = {
  advance: 'blue',
  fine: 'red',
  bonus: 'green',
  deduction: 'orange',
};

const METHOD_LABEL: Record<string, string> = {
  cash: 'Наличные',
  bank: 'Банк',
  card: 'Карта',
};

interface Props {
  payrollId: string | null;
  open: boolean;
  onClose: () => void;
}

export function PayrollDetailDrawer({ payrollId, open, onClose }: Props) {
  const { data, isLoading } = usePayroll(open ? payrollId ?? undefined : undefined);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const accrued = Number(data?.accrued ?? 0);
  const advance = Number(data?.advance ?? 0);
  const fines = Number(data?.fines ?? 0);
  const bonus = Number(data?.bonus ?? 0);
  const deductions = Number(data?.deductions ?? 0);
  const paid = Number(data?.paid ?? 0);
  const net = accrued - advance - fines + bonus - deductions;
  const remaining = Math.max(0, net - paid);
  const paidPct = net > 0 ? Math.min(100, (paid / net) * 100) : 0;

  const lineColumns: ColumnsType<PayrollLine> = [
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (v: string) => formatDate(v),
    },
    {
      title: 'Тип',
      dataIndex: 'kind',
      key: 'kind',
      width: 130,
      render: (k: PayrollLineKind) => <Tag color={LINE_COLOR[k]}>{LINE_LABEL[k] ?? k}</Tag>,
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      width: 140,
      render: (v: number) => formatMoney(v),
    },
    { title: 'Комментарий', dataIndex: 'note', key: 'note', render: (v) => v ?? '—' },
  ];

  const paymentColumns: ColumnsType<PaymentRow> = [
    {
      title: 'Дата',
      dataIndex: 'paidAt',
      key: 'paidAt',
      width: 110,
      render: (v: string) => formatDate(v),
    },
    {
      title: 'Способ',
      dataIndex: 'method',
      key: 'method',
      width: 130,
      render: (m: string | null) => (m ? <Tag>{METHOD_LABEL[m] ?? m}</Tag> : '—'),
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (v: number) => <strong>{formatMoney(v)}</strong>,
    },
  ];

  const onDownloadPdf = async () => {
    if (!payrollId) return;
    setPdfLoading(true);
    try {
      await downloadFile(
        apiRoutes.reports.payrollSlipPdf(payrollId),
        {},
        `payroll-slip-${data?.employee?.fullName ?? payrollId}.pdf`,
      );
    } catch {
      message.error('Не удалось скачать PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <Drawer
      title={data ? `Ведомость · ${data.employee?.fullName ?? ''}` : 'Ведомость'}
      open={open}
      onClose={onClose}
      width={760}
      destroyOnHidden
      extra={
        <Space>
          <Button
            icon={<FilePdfOutlined />}
            onClick={onDownloadPdf}
            loading={pdfLoading}
            disabled={!data}
          >
            Листок
          </Button>
          <Button
            icon={<MinusCircleOutlined />}
            onClick={() => setAdjustOpen(true)}
            disabled={!data}
          >
            Корректировка
          </Button>
          <Button
            type="primary"
            icon={<DollarOutlined />}
            onClick={() => setPayOpen(true)}
            disabled={!data || remaining === 0}
          >
            Выплатить
          </Button>
        </Space>
      }
    >
      {isLoading || !data ? (
        <Skeleton active />
      ) : (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Descriptions column={{ xs: 1, sm: 2 }} size="small">
            <Descriptions.Item label="Сотрудник">{data.employee?.fullName ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Должность">{data.employee?.role ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="Период" span={2}>
              {formatDate(data.periodStart)} — {formatDate(data.periodEnd)}
            </Descriptions.Item>
          </Descriptions>

          <Row gutter={[16, 16]}>
            <Col xs={12} md={8}>
              <Statistic title="Начислено" value={formatMoney(accrued)} />
            </Col>
            <Col xs={12} md={8}>
              <Statistic title="Аванс" value={formatMoney(advance)} />
            </Col>
            <Col xs={12} md={8}>
              <Statistic title="Штрафы" value={formatMoney(fines)} />
            </Col>
            <Col xs={12} md={8}>
              <Statistic title="Премия" value={formatMoney(bonus)} />
            </Col>
            <Col xs={12} md={8}>
              <Statistic title="Удержания" value={formatMoney(deductions)} />
            </Col>
            <Col xs={12} md={8}>
              <Statistic
                title="К выплате"
                value={formatMoney(net)}
                valueStyle={{ color: '#1677ff' }}
              />
            </Col>
          </Row>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>
                Выплачено: <strong>{formatMoney(paid)}</strong> из {formatMoney(net)}
              </span>
              <span style={{ color: remaining > 0 ? '#cf1322' : '#3f8600' }}>
                Остаток: {formatMoney(remaining)}
              </span>
            </div>
            <Progress percent={Math.round(paidPct)} />
          </div>

          <Divider orientation="left" style={{ marginTop: 0 }}>
            Корректировки
          </Divider>
          {data.lines.length === 0 ? (
            <Empty description="Нет корректировок" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <Table<PayrollLine>
              rowKey="id"
              size="small"
              columns={lineColumns}
              dataSource={data.lines}
              pagination={false}
            />
          )}

          <Divider orientation="left">Выплаты</Divider>
          {data.payments.length === 0 ? (
            <Empty description="Нет выплат" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <Table<PaymentRow>
              rowKey="id"
              size="small"
              columns={paymentColumns}
              dataSource={data.payments}
              pagination={false}
            />
          )}
        </Space>
      )}
      <PayrollLineDrawer
        payroll={data ?? null}
        open={adjustOpen}
        onClose={() => setAdjustOpen(false)}
      />
      <PaymentDrawer
        payroll={data ?? null}
        open={payOpen}
        onClose={() => setPayOpen(false)}
      />
    </Drawer>
  );
}
