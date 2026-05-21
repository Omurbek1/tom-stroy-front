# Tom-Stroy Enterprise Design System

## Theme Model

Theme is driven by semantic CSS variables in `src/app/globals.css`.

Use semantic tokens instead of hardcoded colors:

```tsx
className="bg-background text-foreground border-border"
```

Avoid:

```tsx
className="bg-white text-black"
style={{ color: '#1677ff' }}
```

## Core Tokens

- `--color-background`: app canvas
- `--color-surface`: cards, tables, panels
- `--color-surface-subtle`: table headers and hover states
- `--color-elevated`: popovers, modals, dropdowns
- `--color-border`: default separators
- `--color-foreground`: primary text
- `--color-text-muted`: secondary text
- `--color-primary`: primary action
- `--color-success`, `--color-warning`, `--color-danger`, `--color-info`: state colors

## Domain Tokens

- Warehouse: `--status-stock-low`, `--status-stock-in`, `--status-stock-out`
- Finance: `--finance-income`, `--finance-expense`, `--finance-pending`
- Projects: `--status-project-active`, `--status-project-paused`, `--status-project-delayed`, `--status-project-completed`
- Tasks: `--task-todo`, `--task-progress`, `--task-done`

## Layout Pattern

Enterprise pages should use:

```tsx
<PageHeader title="..." subtitle="..." />
<PageToolbar search={...} filters={...} actions={...} />
<PageContainer>
  <DataWidget />
</PageContainer>
```

Page-level search, filters, date ranges, create/export actions belong in `PageToolbar`.
Cards and tables should show data, not page controls.

## Density

Use 4px rhythm:

- compact controls: 28-36px
- toolbar: 48px
- global header: 56px
- page padding: 16-24px
- cards: 12px radius, subtle border
- tables: `size="small"`, sticky headers, horizontal scroll via `DataTable`

## Ant Design

AntD tokens are configured in `src/app-init/providers/antd-provider.tsx`.
When adding AntD components, prefer provider tokens and CSS variables over inline color overrides.

## Charts

Charts use CSS variables:

- `--chart-revenue`
- `--chart-materials`
- `--chart-labor`
- `--chart-equipment`
- `--chart-other`
- `--chart-profit`
- `--chart-grid`
- `--chart-axis`

## Accessibility

- Keep WCAG contrast by using semantic tokens.
- Preserve keyboard focus with `:focus-visible`.
- Buttons need `aria-label` when icon-only.
- Do not remove table headers for visual compactness.
