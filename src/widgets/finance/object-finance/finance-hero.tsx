'use client';

import { Card, Progress, Skeleton, Tooltip } from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  InfoCircleOutlined,
  RiseOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { usePnl } from '@entities/finance/hooks';
import { useProjectAnalytics, useProject } from '@entities/project/hooks';
import { formatMoney, formatNumber } from '@shared/lib/format';
import './object-finance.css';

interface Props {
  projectId: string;
  from: string;
  to: string;
}

/**
 * Executive KPI strip: 4 large tiles. Each tile speaks plain Russian
 * so a non-engineer (investor, owner) instantly understands состояние.
 *
 * Tiles:
 *   1. Бюджет        — план vs освоено, прогресс-бар
 *   2. Себестоимость — мат + работы + техника + прочее (с подсказкой)
 *   3. Прибыль       — абс + маржа, цветовая индикация
 *   4. Прогресс      — м³ / план + прогноз дней до сдачи
 */
export function FinanceHero({ projectId, from, to }: Props) {
  const { data: project } = useProject(projectId);
  const { data: pnl, isLoading: pnlLoading } = usePnl({ from, to, projectId });
  const { data: analytics, isLoading: anLoading } = useProjectAnalytics(projectId);

  if (pnlLoading || anLoading || !pnl || !analytics) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 3 }} />
      </Card>
    );
  }

  const budget = analytics.budget || project?.budget || 0;
  const earnedRevenue = analytics.revenue || pnl.revenue;
  const budgetUsedPct =
    budget > 0 ? Math.min(100, Math.round((earnedRevenue / budget) * 100)) : 0;

  const totalCost = pnl.totalCost;
  const profit = pnl.profit;
  const margin = pnl.margin;
  const profitColor =
    profit > 0 ? 'var(--finance-income)' : profit < 0 ? 'var(--finance-expense)' : undefined;

  const progressPct = Math.round(analytics.progress);
  const forecast = analytics.forecastDays;
  const planUnitLabel: Record<string, string> = {
    M3: 'м³',
    M2: 'м²',
    M: 'м',
    HOUR: 'ч',
    SHIFT: 'смен',
    PIECE: 'шт',
  };
  const unit = planUnitLabel[project?.planUnit ?? 'M3'] ?? '';

  return (
    <div className="ofx-hero">
      <Tile
        accent="blue"
        icon={<WalletOutlined />}
        label="Бюджет объекта"
        value={formatMoney(budget)}
        hint="Сумма по договору. Освоено = выполнено и принято работ от заказчика."
      >
        <div className="ofx-tile__sub">
          Освоено <strong>{formatMoney(earnedRevenue)}</strong>{' '}
          <span className="ofx-tile__pct">({budgetUsedPct}%)</span>
        </div>
        <Progress
          percent={budgetUsedPct}
          showInfo={false}
          strokeColor={budgetUsedPct >= 100 ? '#52c41a' : '#1677ff'}
          size="small"
          style={{ marginTop: 6 }}
        />
      </Tile>

      <Tile
        accent="orange"
        icon={<ArrowDownOutlined />}
        label="Себестоимость"
        value={formatMoney(totalCost)}
        hint="Все фактические расходы по объекту: материалы, работы бригад, техника и прочее."
      >
        <div className="ofx-tile__breakdown">
          <Row label="Материалы" value={pnl.materialsCost} dot="materials" />
          <Row label="Работы" value={pnl.laborCost} dot="labor" />
          <Row label="Техника" value={pnl.equipmentCost} dot="equipment" />
          <Row label="Прочее" value={pnl.otherExpensesTotal} dot="other" />
        </div>
      </Tile>

      <Tile
        accent={profit >= 0 ? 'green' : 'red'}
        icon={profit >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
        label={profit >= 0 ? 'Валовая прибыль' : 'Убыток'}
        value={<span style={{ color: profitColor }}>{formatMoney(Math.abs(profit))}</span>}
        hint="Освоено минус себестоимость. Маржа = прибыль ÷ освоенный доход."
      >
        <div className="ofx-tile__sub">
          Маржа{' '}
          <strong style={{ color: profitColor }}>
            {profit >= 0 ? '+' : '−'}
            {formatNumber(Math.abs(margin))}%
          </strong>
        </div>
        <div className="ofx-tile__hint-line">
          {profit >= 0
            ? 'Объект приносит прибыль'
            : 'Объект пока убыточный — себестоимость превышает освоение'}
        </div>
      </Tile>

      <Tile
        accent="purple"
        icon={<RiseOutlined />}
        label="Прогресс выполнения"
        value={`${progressPct}%`}
        hint="Доля выполненного объёма от плановой. Прогноз основан на темпе последних 7 дней."
      >
        <div className="ofx-tile__sub">
          <strong>{formatNumber(analytics.doneVolume)}</strong> из{' '}
          {formatNumber(analytics.planVolume)} {unit}
        </div>
        <Progress
          percent={progressPct}
          showInfo={false}
          strokeColor="#722ed1"
          size="small"
          style={{ marginTop: 6 }}
        />
        <div className="ofx-tile__hint-line">
          {forecast == null
            ? 'Прогноз появится после первых отчётов'
            : forecast === 0
              ? 'План выполнен'
              : `Прогноз сдачи: ~${formatNumber(forecast)} дн.`}
        </div>
      </Tile>
    </div>
  );
}

function Tile({
  accent,
  icon,
  label,
  value,
  hint,
  children,
}: {
  accent: 'blue' | 'orange' | 'green' | 'red' | 'purple';
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`ofx-tile ofx-tile--${accent}`}>
      <div className="ofx-tile__head">
        <span className="ofx-tile__icon">{icon}</span>
        <span className="ofx-tile__label">{label}</span>
        {hint && (
          <Tooltip title={hint} placement="top">
            <InfoCircleOutlined className="ofx-tile__info" />
          </Tooltip>
        )}
      </div>
      <div className="ofx-tile__value">{value}</div>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  dot,
}: {
  label: string;
  value: number;
  dot: 'materials' | 'labor' | 'equipment' | 'other';
}) {
  return (
    <div className="ofx-row">
      <span className={`ofx-row__dot ofx-row__dot--${dot}`} />
      <span className="ofx-row__label">{label}</span>
      <span className="ofx-row__value">{formatMoney(value)}</span>
    </div>
  );
}
