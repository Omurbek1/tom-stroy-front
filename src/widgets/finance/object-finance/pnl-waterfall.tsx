'use client';

import { useMemo } from 'react';
import { Card, Skeleton, Tooltip } from 'antd';
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { InfoCircleOutlined } from '@ant-design/icons';
import { usePnl } from '@entities/finance/hooks';
import { formatMoney } from '@shared/lib/format';
import './object-finance.css';

interface Props {
  projectId: string;
  from: string;
  to: string;
}

/**
 * P&L waterfall — каскадная диаграмма «как доход превращается в прибыль».
 * Доход → −Материалы → −Работы → −Техника → −Прочее → Прибыль.
 *
 * Каждый столбик показывает не абсолютную сумму, а вклад в финансовый
 * результат: первый и последний — полные столбики (Доход, Прибыль), а
 * промежуточные сидят на «плавающей» базе и читаются как вычеты.
 *
 * Это самая инвестор-friendly визуализация P&L — её используют
 * Bloomberg, Notion и крупные FP&A инструменты.
 */
export function PnlWaterfall({ projectId, from, to }: Props) {
  const { data, isLoading } = usePnl({ from, to, projectId });

  const chart = useMemo(() => {
    if (!data) return [];
    const revenue = data.revenue;
    const materials = data.materialsCost;
    const labor = data.laborCost;
    const equipment = data.equipmentCost;
    const other = data.otherExpensesTotal;
    const profit = data.profit;

    // Each step shows: base (invisible filler) + value (visible bar).
    let cursor = revenue;
    const step = (label: string, delta: number, kind: 'in' | 'out' | 'net') => {
      if (kind === 'in') {
        return {
          name: label,
          base: 0,
          value: delta,
          total: delta,
          kind,
        };
      }
      if (kind === 'out') {
        const top = cursor;
        cursor -= delta;
        return {
          name: label,
          base: cursor,
          value: delta,
          total: top,
          kind,
        };
      }
      // net total
      return { name: label, base: 0, value: Math.max(0, delta), total: delta, kind };
    };

    return [
      step('Доход', revenue, 'in'),
      step('Материалы', materials, 'out'),
      step('Работы', labor, 'out'),
      step('Техника', equipment, 'out'),
      step('Прочее', other, 'out'),
      step('Прибыль', profit, 'net'),
    ];
  }, [data]);

  if (isLoading || !data) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  const colorByKind: Record<string, string> = {
    in: 'var(--chart-revenue, #1677ff)',
    out: 'var(--chart-materials, #fa8c16)',
    net: data.profit >= 0 ? 'var(--chart-labor, #52c41a)' : 'var(--finance-expense, #cf1322)',
  };

  // Custom colors per category for the deduction segments
  const outShades = ['#fa8c16', '#d4380d', '#722ed1', '#8c8c8c'];
  let outIdx = 0;

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Как доход становится прибылью</span>
          <Tooltip title="Каждый столбик показывает вычет из дохода. Последний столбик — что осталось как прибыль.">
            <InfoCircleOutlined style={{ color: '#bfbfbf' }} />
          </Tooltip>
        </div>
      }
    >
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <BarChart data={chart} margin={{ top: 24, right: 16, left: 8, bottom: 8 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => formatMoney(Number(v))} width={110} />
            {/* Invisible filler that pushes the visible bar up to the cursor */}
            <Bar dataKey="base" stackId="a" fill="transparent" isAnimationActive={false} />
            <Bar dataKey="value" stackId="a" radius={[4, 4, 0, 0]}>
              {chart.map((entry, i) => {
                let fill = colorByKind[entry.kind];
                if (entry.kind === 'out') {
                  fill = outShades[outIdx % outShades.length];
                  outIdx += 1;
                }
                return <Cell key={`cell-${i}`} fill={fill} />;
              })}
              <LabelList
                dataKey="total"
                position="top"
                formatter={(v: number) => formatMoney(v)}
                style={{ fill: 'var(--ant-color-text)', fontSize: 11, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="ofx-waterfall__legend">
        <span>
          <i className="ofx-waterfall__dot" style={{ background: colorByKind.in }} />
          Доход — освоено по выполненным работам
        </span>
        <span>
          <i className="ofx-waterfall__dot" style={{ background: outShades[0] }} />
          Расходы — материалы, ФОТ, техника, прочее
        </span>
        <span>
          <i className="ofx-waterfall__dot" style={{ background: colorByKind.net }} />
          {data.profit >= 0 ? 'Прибыль — то, что осталось' : 'Убыток — расходы превысили доход'}
        </span>
      </div>
    </Card>
  );
}
