'use client';

import { ReactNode } from 'react';
import { PageMeta } from './page-meta';
import { PageToolbar } from './page-toolbar';

interface Props {
  title: string;
  subtitle?: string;
  stats?: ReactNode;
  extra?: ReactNode;
  breadcrumbs?: {
    href?: string;
    label: string;
  }[];
}

/**
 * Page-level identity block. Actions belong in PageToolbar; `extra` is
 * kept as a migration bridge and is rendered in a compact toolbar row.
 */
export function PageHeader({ title, subtitle, stats, extra, breadcrumbs }: Props) {
  return (
    <>
      <PageMeta title={title} subtitle={subtitle} breadcrumbs={breadcrumbs} />
      <section className="page-header" aria-labelledby="page-title">
        <div className="page-header__main">
          <h1 id="page-title" className="page-header__title">
            {title}
          </h1>
          {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        </div>
        {stats && <div className="page-header__stats">{stats}</div>}
      </section>
      {extra && <PageToolbar actions={extra} />}
    </>
  );
}
