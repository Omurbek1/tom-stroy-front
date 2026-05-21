/**
 * Streaming-rendered while any (workspace)/* route's data is fetching.
 * Sidebar + UniversalHeader keep rendering — only the page body shows
 * the skeleton, so the layout feels instant.
 *
 * Pure CSS (no JS bundle, no AntD) — paints on the first frame instead
 * of waiting for client hydration like a Skeleton component would.
 */
export default function WorkspaceLoading() {
  return (
    <div className="page-loading" aria-busy="true" aria-label="Загрузка">
      <div className="page-loading__bar page-loading__bar--xl" />
      <div className="page-loading__row">
        <div className="page-loading__card" />
        <div className="page-loading__card" />
        <div className="page-loading__card" />
        <div className="page-loading__card" />
      </div>
      <div className="page-loading__bar" />
      <div className="page-loading__bar page-loading__bar--md" />
      <div className="page-loading__bar" />
      <div className="page-loading__bar page-loading__bar--sm" />
    </div>
  );
}
