'use client';

import { Typography } from 'antd';
import { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
}

/**
 * Sticky page header. Rendered at the top of every page; sticks to the
 * top of `.app-shell__content` while user scrolls the page body.
 *
 * Use `<PageHeader title=... subtitle=... extra={...} />` exactly once per
 * page, before any scrollable content.
 */
export function PageHeader({ title, subtitle, extra }: Props) {
  return (
    <div className="page-header">
      <div className="page-header__text">
        <Typography.Title level={4} className="page-header__title">
          {title}
        </Typography.Title>
        {subtitle && (
          <Typography.Text type="secondary" className="page-header__subtitle">
            {subtitle}
          </Typography.Text>
        )}
      </div>
      {extra && <div className="page-header__actions">{extra}</div>}
    </div>
  );
}
