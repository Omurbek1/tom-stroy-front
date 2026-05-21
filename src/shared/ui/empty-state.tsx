'use client';

import { Button, Typography } from 'antd';
import { ReactNode } from 'react';

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void; icon?: ReactNode };
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state__icon">{icon}</div>}
      <Typography.Title level={5} style={{ marginBottom: 4 }}>
        {title}
      </Typography.Title>
      {description && (
        <Typography.Text type="secondary" className="empty-state__desc">
          {description}
        </Typography.Text>
      )}
      {action && (
        <Button
          type="primary"
          icon={action.icon}
          onClick={action.onClick}
          className="empty-state__action"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
