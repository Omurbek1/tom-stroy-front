/**
 * Skeleton shown while switching tabs inside an object workspace.
 * ObjectHeader + ObjectTabs stay rendered (they live in the parent
 * layout) — only the page body shows the skeleton, so tab switches
 * feel instant.
 *
 * Pure CSS — no JS bundle, no AntD; paints on the first frame.
 */
export default function ObjectTabLoading() {
  return (
    <div className="page-loading page-loading--inset" aria-busy="true" aria-label="Загрузка">
      <div className="page-loading__row">
        <div className="page-loading__card" />
        <div className="page-loading__card" />
        <div className="page-loading__card" />
      </div>
      <div className="page-loading__bar" />
      <div className="page-loading__bar page-loading__bar--md" />
      <div className="page-loading__bar page-loading__bar--sm" />
    </div>
  );
}
