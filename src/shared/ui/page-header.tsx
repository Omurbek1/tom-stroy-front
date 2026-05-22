'use client';

import { ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { RightOutlined } from '@ant-design/icons';
import { Crumb, usePageMetaStore } from '@app-init/store/page-meta-store';

interface Props {
  /** H1 of the page. Also registered in the global page-meta store so
   *  the UniversalHeader breadcrumbs stay in sync. */
  title: string;
  /** Optional one-line caption under the title. */
  subtitle?: ReactNode;
  /** Crumbs shown ABOVE the title row. Last entry is the current page. */
  breadcrumbs?: Crumb[];
  /** Right-hand actions (buttons, exports). */
  actions?: ReactNode;
  /** Second row — period picker, segmented chips, filters, search… */
  filters?: ReactNode;
  /** KPI strip / stats row rendered next to the title (Linear-style). */
  stats?: ReactNode;
  /** When false, the header scrolls normally with the page. Default: true. */
  sticky?: boolean;
  /** Disable the bottom border (rarely needed). */
  bordered?: boolean;
  /** Legacy migration prop — same as `actions`. */
  extra?: ReactNode;
}

/**
 * Universal enterprise PageHeader. Pattern matches Linear / Notion /
 * Stripe Dashboard: breadcrumbs → title row (h1 + actions) → optional
 * filters row, all in one sticky block at the top of the page scroll
 * viewport.
 *
 *   ┌──────────────────────────────────────────────┐
 *   │ Breadcrumb › Breadcrumb › Page               │
 *   │ Page title                  [Action] [Action]│
 *   │ Subtitle                                     │
 *   │──────────────────────────────────────────────│  ← bordered
 *   │ [Filters · Period · Search]                  │  ← optional row
 *   └──────────────────────────────────────────────┘
 *
 * Sticky math:
 *   - lives inside `.app-shell__content` (the scroll container)
 *   - `top: 0` (UniversalHeader is OUTSIDE the scroll container)
 *   - z-index: `--z-sticky-header` (≥ toolbar, < dropdown)
 *
 * Stacking-context safety:
 *   - solid background (NOT backdrop-filter / transform)
 *   - AntD popups escape via global getPopupContainer→body
 */
export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  filters,
  stats,
  sticky = true,
  bordered = true,
  extra,
}: Props) {
  const resolvedActions = actions ?? extra;
  // Mirror title + breadcrumbs into the global header — that's where
  // the in-app chrome shows them. Keeps PageMeta semantics so any
  // page that uses PageHeader doesn't need PageMeta separately.
  const setMeta = usePageMetaStore((s) => s.set);
  useEffect(() => {
    setMeta({
      title,
      subtitle: typeof subtitle === 'string' ? subtitle : undefined,
      actions: resolvedActions,
      breadcrumbs,
    });
  });

  return (
    <header
      className={[
        'page-header',
        sticky && 'page-header--sticky',
        bordered && 'page-header--bordered',
        filters && 'page-header--has-filters',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={title}
    >
      <div className="page-header__inner">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="page-header__crumbs" aria-label="Хлебные крошки">
            {breadcrumbs.map((c, i) => {
              const last = i === breadcrumbs.length - 1;
              return (
                <span key={`${c.label}-${i}`} className="page-header__crumb-row">
                  {c.href && !last ? (
                    <Link href={c.href} className="page-header__crumb">
                      {c.label}
                    </Link>
                  ) : (
                    <span
                      className="page-header__crumb page-header__crumb--current"
                      aria-current={last ? 'page' : undefined}
                    >
                      {c.label}
                    </span>
                  )}
                  {!last && (
                    <RightOutlined className="page-header__crumb-sep" aria-hidden />
                  )}
                </span>
              );
            })}
          </nav>
        )}

        <div className="page-header__main">
          <div className="page-header__title-block">
            <h1 className="page-header__title">{title}</h1>
            {subtitle && <div className="page-header__subtitle">{subtitle}</div>}
          </div>
          {stats && <div className="page-header__stats">{stats}</div>}
          {resolvedActions && (
            <div className="page-header__actions">{resolvedActions}</div>
          )}
        </div>
      </div>

      {filters && (
        <div className="page-header__filters" role="toolbar" aria-label="Фильтры">
          {filters}
        </div>
      )}
    </header>
  );
}
