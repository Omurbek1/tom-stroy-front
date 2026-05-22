'use client';

import { Card, Skeleton, Tag, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { usePnl } from '@entities/finance/hooks';
import { useProject, useProjectAnalytics } from '@entities/project/hooks';
import { formatMoney, formatNumber } from '@shared/lib/format';
import './object-finance.css';

interface Props {
  projectId: string;
  from: string;
  to: string;
}

/**
 * Budget burn-down: одна горизонтальная "линейка" показывающая, как
 * бюджет объекта (100%) делится между:
 *   - фактическая себестоимость
 *   - валовая прибыль (если есть)
 *   - неосвоенный остаток (буфер)
 *
 * Цель — за две секунды показать инвестору, в зелёной ли мы зоне.
 */
export function BudgetBurndown({ projectId, from, to }: Props) {
  const { data: project } = useProject(projectId);
  const { data: analytics, isLoading: anLoading } = useProjectAnalytics(projectId);
  const { data: pnl, isLoading: pnlLoading } = usePnl({ from, to, projectId });

  if (anLoading || pnlLoading || !analytics || !pnl) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 2 }} />
      </Card>
    );
  }

  const budget = analytics.budget || project?.budget || 0;
  const cost = pnl.totalCost;
  const profit = pnl.profit;
  const earned = analytics.revenue || pnl.revenue;
  const remaining = Math.max(0, budget - earned);

  const pct = (n: number) => (budget > 0 ? (n / budget) * 100 : 0);

  // Status indicator based on cost-to-revenue health
  const burnRate = earned > 0 ? cost / earned : 0;
  let status: { color: string; label: string; tone: string };
  if (earned === 0) {
    status = { color: 'default', label: 'Объект ещё не начат', tone: 'gray' };
  } else if (burnRate < 0.8) {
    status = { color: 'green', label: 'Здоровая маржа', tone: 'green' };
  } else if (burnRate < 1) {
    status = { color: 'gold', label: 'Маржа сжимается', tone: 'gold' };
  } else if (burnRate < 1.2) {
    status = { color: 'orange', label: 'Точка безубыточности', tone: 'orange' };
  } else {
    status = { color: 'red', label: 'Перерасход — нужна корректировка', tone: 'red' };
  }

  const profitWidth = Math.max(0, pct(profit));
  const costWidth = Math.min(100, pct(cost));
  const remainWidth = Math.max(0, 100 - costWidth - profitWidth);

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Освоение бюджета</span>
          <Tooltip title="Как распределяется бюджет объекта: что уже потрачено, какая прибыль и сколько ещё можно освоить.">
            <InfoCircleOutlined style={{ color: '#bfbfbf' }} />
          </Tooltip>
          <Tag color={status.color} style={{ marginLeft: 'auto' }}>
            {status.label}
          </Tag>
        </div>
      }
    >
      <div className="ofx-burn">
        <div className="ofx-burn__bar">
          <div
            className="ofx-burn__seg ofx-burn__seg--cost"
            style={{ width: `${costWidth}%` }}
            title={`Себестоимость: ${formatMoney(cost)}`}
          />
          {profit > 0 && (
            <div
              className="ofx-burn__seg ofx-burn__seg--profit"
              style={{ width: `${profitWidth}%` }}
              title={`Прибыль: ${formatMoney(profit)}`}
            />
          )}
          <div
            className="ofx-burn__seg ofx-burn__seg--remain"
            style={{ width: `${remainWidth}%` }}
            title={`Не освоено: ${formatMoney(remaining)}`}
          />
        </div>
        <div className="ofx-burn__legend">
          <Legend
            color="var(--finance-expense, #fa541c)"
            label="Себестоимость"
            value={cost}
            pct={pct(cost)}
          />
          {profit > 0 ? (
            <Legend
              color="var(--finance-income, #52c41a)"
              label="Прибыль"
              value={profit}
              pct={pct(profit)}
            />
          ) : (
            <Legend
              color="var(--finance-expense, #cf1322)"
              label="Убыток"
              value={Math.abs(profit)}
              pct={pct(Math.abs(profit))}
              negative
            />
          )}
          <Legend
            color="#d9d9d9"
            label="Резерв бюджета"
            value={remaining}
            pct={pct(remaining)}
          />
        </div>
        <div className="ofx-burn__summary">
          Бюджет <strong>{formatMoney(budget)}</strong> • Освоено{' '}
          <strong>{formatMoney(earned)}</strong> • Себестоимость{' '}
          <strong>{formatMoney(cost)}</strong>
          {budget > 0 && (
            <> • Расход на 1 сом дохода: <strong>{formatNumber(burnRate)}</strong></>
          )}
        </div>
      </div>
    </Card>
  );
}

function Legend({
  color,
  label,
  value,
  pct,
  negative,
}: {
  color: string;
  label: string;
  value: number;
  pct: number;
  negative?: boolean;
}) {
  return (
    <div className="ofx-burn__legend-item">
      <span className="ofx-burn__dot" style={{ background: color }} />
      <div className="ofx-burn__legend-text">
        <div className="ofx-burn__legend-label">{label}</div>
        <div className="ofx-burn__legend-value">
          {negative ? '−' : ''}
          {formatMoney(value)}{' '}
          <span className="ofx-burn__legend-pct">{formatNumber(pct)}%</span>
        </div>
      </div>
    </div>
  );
}
