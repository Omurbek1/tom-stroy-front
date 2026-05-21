export const apiRoutes = {
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  projects: {
    list: '/projects',
    detail: (id: string) => `/projects/${id}`,
    analytics: (id: string) => `/projects/${id}/analytics`,
    archive: (id: string) => `/projects/${id}/archive`,
  },
  dailyReports: {
    list: '/daily-reports',
    detail: (id: string) => `/daily-reports/${id}`,
    create: '/daily-reports',
  },
  brigades: { list: '/brigades' },
  employees: { list: '/employees' },
  warehouses: { list: '/warehouses' },
  inventory: {
    items: '/inventory/items',
    transactions: '/inventory/transactions',
    receipts: '/inventory/receipts',
  },
  attendance: { list: '/attendance' },
  payroll: { preview: '/payroll/preview' },
  finance: {
    expenses: '/finance/expenses',
    incomes: '/finance/incomes',
    pnl: '/finance/pnl',
    timeseries: '/finance/timeseries',
  },
  ai: { projectBrief: (id: string) => `/ai/projects/${id}/brief` },
  documents: {
    list: '/documents',
    presign: '/documents/presign',
    create: '/documents',
  },
} as const;

export const appRoutes = {
  login: '/login',
  dashboard: '/dashboard',
  projects: '/projects',
  projectDetail: (id: string) => `/projects/${id}`,
  brigades: '/brigades',
  employees: '/employees',
  warehouse: '/warehouse',
  finance: '/finance',
  payroll: '/payroll',
  analytics: '/analytics',
  vehicles: '/vehicles',
  reports: '/reports',
  settings: '/settings',
} as const;
