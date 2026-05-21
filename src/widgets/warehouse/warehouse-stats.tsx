'use client';

import {
  AlertOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  DropboxOutlined,
} from '@ant-design/icons';
import { Col, Row } from 'antd';
import { useInventoryStats } from '@entities/inventory-item/hooks';
import { StatsCard } from '@shared/ui/stats-card';
import { formatMoney, formatDate } from '@shared/lib/format';

const MOVEMENT_LABEL: Record<string, string> = {
  RECEIPT: 'Приход',
  WRITEOFF: 'Расход',
  TRANSFER: 'Перемещение',
  RETURN: 'Возврат',
  ADJUSTMENT: 'Коррекция',
};

export function WarehouseStats() {
  const { data, isLoading } = useInventoryStats();

  return (
    <Row gutter={[12, 12]}>
      <Col xs={24} sm={12} md={6}>
        <StatsCard
          label="Всего товаров"
          icon={<DropboxOutlined />}
          loading={isLoading}
          value={data?.totalItems ?? 0}
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <StatsCard
          label="Низкие остатки"
          icon={<AlertOutlined />}
          loading={isLoading}
          tone={(data?.lowStockCount ?? 0) > 0 ? 'danger' : 'default'}
          value={data?.lowStockCount ?? 0}
          hint={
            (data?.lowStockCount ?? 0) > 0
              ? 'Требуется пополнение'
              : 'Все позиции в норме'
          }
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <StatsCard
          label="Стоимость склада"
          icon={<DollarOutlined />}
          loading={isLoading}
          value={formatMoney(data?.totalValue ?? 0)}
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <StatsCard
          label="Последнее движение"
          icon={<ClockCircleOutlined />}
          loading={isLoading}
          value={data?.lastMovement ? formatDate(data.lastMovement) : '—'}
          hint={
            data?.lastMovementType
              ? MOVEMENT_LABEL[data.lastMovementType] ?? data.lastMovementType
              : undefined
          }
        />
      </Col>
    </Row>
  );
}
