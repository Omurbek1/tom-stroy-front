import { Skeleton } from 'antd';

/**
 * Streaming-rendered while any (workspace)/* route's data is fetching.
 * Sidebar + UniversalHeader keep rendering — only the page body shows
 * the skeleton, so the layout feels instant.
 */
export default function WorkspaceLoading() {
  return (
    <div className="page-container">
      <Skeleton active paragraph={{ rows: 4 }} />
      <Skeleton active paragraph={{ rows: 6 }} />
    </div>
  );
}
