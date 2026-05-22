'use client';

import { useMemo } from 'react';
import { DatePicker, Segmented, Space } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

export type AnalyticsPeriod =
  | 'today'
  | '7d'
  | '30d'
  | 'month'
  | 'year'
  | 'all'
  | 'custom';

export interface AnalyticsRange {
  from: string;
  to: string;
  period: AnalyticsPeriod;
}

interface Props {
  value: AnalyticsRange;
  onChange: (next: AnalyticsRange) => void;
  /** Lower bound for "Всё время". Defaults to 2000-01-01. */
  earliest?: string | null;
  /** Hide "Всё время" — useful for views with no logical "all". */
  withoutAll?: boolean;
}

const OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: 'today', label: 'Сегодня' },
  { value: '7d', label: '7 дней' },
  { value: '30d', label: '30 дней' },
  { value: 'month', label: 'Месяц' },
  { value: 'year', label: 'Год' },
  { value: 'all', label: 'Всё время' },
];

export function computeAnalyticsPeriod(
  period: AnalyticsPeriod,
  earliest?: string | null,
): AnalyticsRange {
  const now = dayjs();
  if (period === 'today') {
    return { from: now.startOf('day').toISOString(), to: now.endOf('day').toISOString(), period };
  }
  if (period === '7d') {
    return {
      from: now.subtract(7, 'day').startOf('day').toISOString(),
      to: now.endOf('day').toISOString(),
      period,
    };
  }
  if (period === '30d') {
    return {
      from: now.subtract(30, 'day').startOf('day').toISOString(),
      to: now.endOf('day').toISOString(),
      period,
    };
  }
  if (period === 'month') {
    return {
      from: now.startOf('month').toISOString(),
      to: now.endOf('day').toISOString(),
      period,
    };
  }
  if (period === 'year') {
    return {
      from: now.startOf('year').toISOString(),
      to: now.endOf('day').toISOString(),
      period,
    };
  }
  // all
  const lower = earliest ? dayjs(earliest) : dayjs('2000-01-01');
  return {
    from: lower.startOf('day').toISOString(),
    to: now.endOf('day').toISOString(),
    period,
  };
}

export function AnalyticsPeriodPicker({ value, onChange, earliest, withoutAll }: Props) {
  const customValue = useMemo(
    () => [dayjs(value.from), dayjs(value.to)] as [Dayjs, Dayjs],
    [value.from, value.to],
  );
  const options = withoutAll ? OPTIONS.filter((o) => o.value !== 'all') : OPTIONS;

  return (
    <Space wrap size="middle">
      <Segmented<AnalyticsPeriod>
        value={value.period === 'custom' ? '30d' : value.period}
        onChange={(p) => onChange(computeAnalyticsPeriod(p, earliest))}
        options={options}
      />
      <DatePicker.RangePicker
        value={customValue}
        onChange={(range) => {
          if (!range || !range[0] || !range[1]) return;
          onChange({
            from: range[0].startOf('day').toISOString(),
            to: range[1].endOf('day').toISOString(),
            period: 'custom',
          });
        }}
        allowClear={false}
        format="DD.MM.YYYY"
      />
    </Space>
  );
}
