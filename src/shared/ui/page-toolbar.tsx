'use client';

import { ReactNode } from 'react';

interface Props {
  search?: ReactNode;
  filters?: ReactNode;
  tabs?: ReactNode;
  dateRange?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageToolbar({
  search,
  filters,
  tabs,
  dateRange,
  actions,
  className,
}: Props) {
  return (
    <div className={`page-toolbar ${className ?? ''}`} role="toolbar" aria-label="Инструменты страницы">
      <div className="page-toolbar__scroller">
        <div className="page-toolbar__left">
          {search && <div className="page-toolbar__search">{search}</div>}
          {tabs && <div className="page-toolbar__tabs">{tabs}</div>}
          {filters && <div className="page-toolbar__filters">{filters}</div>}
          {dateRange && <div className="page-toolbar__date">{dateRange}</div>}
        </div>
        {actions && <div className="page-toolbar__actions">{actions}</div>}
      </div>
    </div>
  );
}
