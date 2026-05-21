'use client';

import { Card, Statistic } from 'antd';
import { ReactNode } from 'react';

interface Props {
  title: string;
  value: number | string;
  suffix?: ReactNode;
  prefix?: ReactNode;
  precision?: number;
  loading?: boolean;
}

export function StatCard({ title, value, suffix, prefix, precision = 0, loading }: Props) {
  return (
    <Card variant='borderless'>
      <Statistic
        title={title}
        value={value}
        suffix={suffix}
        prefix={prefix}
        precision={precision}
        loading={loading}
      />
    </Card>
  );
}
