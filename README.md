# tom-stroy-front-crm

Next.js 15 (App Router) + TypeScript + Ant Design + Tailwind + React Query + Zustand.
Архитектура — Feature-Sliced Design.

См. [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md).

## Быстрый старт

```bash
cp .env.example .env
npm install
npm run dev
```

Откройте `http://localhost:3000`. Логин: `owner@tomstroy.local` / `owner123!`
(требуется запущенный backend — см. `tom-stroy-backend/README.md`).

## Структура

```
src/
├── app/                    Next.js App Router (routing)
│   ├── layout.tsx, page.tsx, globals.css
│   ├── (auth)/login/
│   └── (workspace)/
│       ├── layout.tsx      AppShell (sidebar + topbar)
│       ├── dashboard/
│       ├── projects/[id]/
│       └── …               brigades, employees, warehouse, finance, payroll, …
│
├── app-init/               FSD app layer (providers, store, socket)
│   ├── providers/          Query, AntD, Auth
│   └── store/              theme-store, auth-store
│
├── widgets/                large UI blocks
│   ├── app-shell/
│   ├── dashboard/          finance-overview, projects-overview
│   └── project/            project-analytics
│
├── features/               user actions
│   └── auth-login/
│
├── entities/               business entities
│   └── project/            api, hooks, types
│
└── shared/
    ├── api/                http (axios + refresh), routes
    ├── lib/                format helpers
    ├── ui/                 status-badge, stat-card, page-header, coming-soon
    └── types/              api response types
```

## Что готово (MVP-ядро)

- Логин / refresh / logout (JWT)
- AppShell с sidebar и переключением темы
- Дашборд (объекты + финансы)
- Список объектов с поиском
- Детальная страница объекта с **realtime-аналитикой** от backend (`/api/projects/:id/analytics`)
- Заглушки для всех остальных пунктов меню

## Roadmap

См. `docs/ARCHITECTURE.md §15`. Ближайшее: форма ежедневного отчёта прораба → виджеты склада/payroll → AI-инсайты.
