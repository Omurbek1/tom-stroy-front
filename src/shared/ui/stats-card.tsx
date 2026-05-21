'use client';

import { Card, Skeleton, Typography } from 'antd';
import { ReactNode } from 'react';

interface Props {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  loading?: boolean;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

const TONE_COLOR: Record<NonNullable<Props['tone']>, string> = {
  default: 'inherit',
  success: '#3f8600',
  warning: '#d48806',
  danger: '#cf1322',
};

export function StatsCard({
  label,
  value,
  hint,
  icon,
  loading = false,
  tone = 'default',
}: Props) {
  return (
    <Card size="small" className="stats-card">
      <div className="stats-card__row">
        <div className="stats-card__text">
          <Typography.Text type="secondary" className="stats-card__label">
            {label}
          </Typography.Text>
          {loading ? (
            <Skeleton.Input active size="small" />
          ) : (
            <div className="stats-card__value" style={{ color: TONE_COLOR[tone] }}>
              {value}
            </div>
          )}
          {hint && !loading && (
            <Typography.Text type="secondary" className="stats-card__hint">
              {hint}
            </Typography.Text>
          )}
        </div>
        {icon && <div className="stats-card__icon">{icon}</div>}
      </div>
    </Card>
  );
}
