'use client';

import { DatePicker, Segmented, Space } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useMemo } from 'react';

export type FinancePeriod = 'month' | 'quarter' | 'year' | 'all' | 'custom';

export interface PeriodRange {
  from: string;
  to: string;
  period: FinancePeriod;
}

interface Props {
  value: PeriodRange;
  onChange: (next: PeriodRange) => void;
  /** Project earliest date — defines the "all time" lower bound. */
  startDate?: string | null;
  /** Project planned end — defines a fallback upper bound for "all". */
  deadline?: string | null;
}

const OPTIONS = [
  { value: 'month', label: 'Месяц' },
  { value: 'quarter', label: 'Квартал' },
  { value: 'year', label: 'Год' },
  { value: 'all', label: 'Всё время' },
];

export function computePeriod(
  period: FinancePeriod,
  startDate?: string | null,
  deadline?: string | null,
): PeriodRange {
  const now = dayjs();
  if (period === 'month') {
    return {
      from: now.startOf('month').toISOString(),
      to: now.endOf('day').toISOString(),
      period,
    };
  }
  if (period === 'quarter') {
    // dayjs `quarter` plugin isn't loaded — compute manually.
    const qStart = now.month(Math.floor(now.month() / 3) * 3).startOf('month');
    return {
      from: qStart.toISOString(),
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
  const lower = startDate ? dayjs(startDate) : dayjs('2000-01-01');
  const upper = deadline ? dayjs(deadline) : now;
  return {
    from: lower.startOf('day').toISOString(),
    to: (upper.isAfter(now) ? upper : now).endOf('day').toISOString(),
    period,
  };
}

export function FinancePeriodPicker({ value, onChange, startDate, deadline }: Props) {
  const customValue = useMemo(
    () => [dayjs(value.from), dayjs(value.to)] as [Dayjs, Dayjs],
    [value.from, value.to],
  );

  return (
    <Space wrap size="middle">
      <Segmented<FinancePeriod>
        value={value.period === 'custom' ? 'all' : value.period}
        onChange={(p) => onChange(computePeriod(p, startDate, deadline))}
        options={OPTIONS as { value: FinancePeriod; label: string }[]}
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
