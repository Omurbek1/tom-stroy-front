'use client';

import { Typography } from 'antd';
import { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
}

export function PageHeader({ title, subtitle, extra }: Props) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
        {subtitle && (
          <Typography.Text type="secondary">{subtitle}</Typography.Text>
        )}
      </div>
      {extra && <div>{extra}</div>}
    </div>
  );
}
