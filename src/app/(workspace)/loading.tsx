'use client';

import { Skeleton } from 'antd';

/**
 * Streaming-rendered while any (workspace)/* route's data is fetching.
 * Renders inside <main className="app-shell__content"> — sidebar/topbar
 * stay interactive, only the page body shows the skeleton.
 */
export default function WorkspaceLoading() {
  return (
    <>
      <div
        className="page-header"
        style={{ position: 'static', background: 'transparent', borderBottom: 'none' }}
      >
        <div className="page-header__text">
          <Skeleton.Input active size="small" style={{ width: 220 }} />
          <div style={{ height: 6 }} />
          <Skeleton.Input active size="small" style={{ width: 320, height: 14 }} />
        </div>
      </div>
      <div className="page-container">
        <Skeleton active paragraph={{ rows: 4 }} />
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    </>
  );
}
