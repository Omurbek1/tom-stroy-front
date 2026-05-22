'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button, Dropdown, Empty, Skeleton, Space, Tag } from 'antd';
import {
  ApartmentOutlined,
  AppstoreOutlined,
  CarOutlined,
  ContainerOutlined,
  DollarOutlined,
  FileTextOutlined,
  PlusOutlined,
  RightOutlined,
  SettingOutlined,
  ShopOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageHeader } from '@shared/ui/page-header';
import { PageContainer } from '@shared/ui/page-container';
import { useCompanyHubOverview } from '@entities/company/hooks';
import type { ActivityEvent, CompanySection, SectionStat } from '@entities/company/types';
import { formatMoney } from '@shared/lib/format';
import { EmployeeFormDrawer } from '@features/edit-employee/ui/employee-form-drawer';
import { CreateBrigadeModal } from '@features/create-brigade/ui/create-brigade-button';
import { CreateSupplierModal } from '@features/create-supplier/ui/create-supplier-modal';
import { CreateWarehouseButton } from '@features/create-warehouse/ui/create-warehouse-button';
import { CreateVehicleButton } from '@features/create-vehicle/ui/create-vehicle-button';
import { CreateInventoryItemButton } from '@features/create-inventory-item/ui/create-inventory-item-button';
import './company.css';

interface SectionMeta {
  key: keyof ReturnType<typeof sectionMetaMap>;
  title: string;
  href: string;
  description: string;
  icon: React.ReactNode;
  accent: 'blue' | 'green' | 'orange' | 'purple' | 'cyan' | 'amber';
}

function sectionMetaMap() {
  return {
    employees: 0,
    brigades: 0,
    vehicles: 0,
    warehouses: 0,
    suppliers: 0,
    materials: 0,
    documents: 0,
    roles: 0,
    payroll: 0,
    settings: 0,
  };
}

const SECTIONS: SectionMeta[] = [
  {
    key: 'employees',
    title: 'Сотрудники',
    href: '/employees',
    description: 'Люди компании, ставки, должности',
    icon: <UserOutlined />,
    accent: 'blue',
  },
  {
    key: 'brigades',
    title: 'Бригады',
    href: '/brigades',
    description: 'Составы, специализации, мини-склады',
    icon: <TeamOutlined />,
    accent: 'cyan',
  },
  {
    key: 'vehicles',
    title: 'Техника',
    href: '/vehicles',
    description: 'Парк техники, журналы, расход топлива',
    icon: <CarOutlined />,
    accent: 'amber',
  },
  {
    key: 'warehouses',
    title: 'Склады',
    href: '/warehouse',
    description: 'Центральные склады, движение, перемещения',
    icon: <ShopOutlined />,
    accent: 'purple',
  },
  {
    key: 'suppliers',
    title: 'Поставщики',
    href: '/warehouse?tab=suppliers',
    description: 'Контрагенты, контакты, рейтинг',
    icon: <ContainerOutlined />,
    accent: 'orange',
  },
  {
    key: 'materials',
    title: 'Материалы',
    href: '/company/materials',
    description: 'Каталог материалов и инструментов',
    icon: <AppstoreOutlined />,
    accent: 'green',
  },
  {
    key: 'documents',
    title: 'Документы',
    href: '/company/documents',
    description: 'Договоры, шаблоны, скан-копии',
    icon: <FileTextOutlined />,
    accent: 'blue',
  },
  {
    key: 'roles',
    title: 'Должности',
    href: '/settings#roles',
    description: 'Роли, ставки и матрица доступа',
    icon: <ApartmentOutlined />,
    accent: 'cyan',
  },
  {
    key: 'payroll',
    title: 'Зарплаты',
    href: '/payroll',
    description: 'Расчёт ЗП, авансы, история выплат',
    icon: <DollarOutlined />,
    accent: 'green',
  },
  {
    key: 'settings',
    title: 'Настройки компании',
    href: '/settings',
    description: 'Реквизиты, ставки НДС, интеграции',
    icon: <SettingOutlined />,
    accent: 'purple',
  },
];

/* ------------------------------------------------------------------ */

export default function CompanyHubPage() {
  const { data, isLoading } = useCompanyHubOverview();

  // Quick-action modal/drawer state — employee + brigade support a
  // controlled `open` API. Supplier/warehouse/vehicle/item come with
  // their own trigger buttons that we render alongside.
  const [employeeOpen, setEmployeeOpen] = useState(false);
  const [brigadeOpen, setBrigadeOpen] = useState(false);

  const quickItems = useMemo(
    () => ({
      items: [
        {
          key: 'employee',
          icon: <UserAddOutlined />,
          label: 'Создать сотрудника',
          onClick: () => setEmployeeOpen(true),
        },
        {
          key: 'brigade',
          icon: <TeamOutlined />,
          label: 'Создать бригаду',
          onClick: () => setBrigadeOpen(true),
        },
      ],
    }),
    [],
  );

  return (
    <>
      <PageHeader
        title="Компания"
        subtitle="Центр управления ресурсами — справочники, активность, KPI"
        breadcrumbs={[{ label: 'Компания' }]}
        actions={
          <Space wrap size="small">
            <CreateSupplierModal />
            <CreateWarehouseButton />
            <CreateVehicleButton />
            <CreateInventoryItemButton />
            <Dropdown menu={quickItems} placement="bottomRight">
              <Button type="primary" icon={<PlusOutlined />}>
                Быстрое действие
              </Button>
            </Dropdown>
          </Space>
        }
      />
      <PageContainer>
        {/* Top KPI strip */}
        <KpiStrip sections={data?.sections} loading={isLoading} />

        <div className="company-grid">
          <div className="company-grid__main">
            <div className="company-section-title">Разделы</div>
            <div className="company-cards">
              {SECTIONS.map((s) => (
                <SectionCard
                  key={s.key}
                  meta={s}
                  data={data?.sections[s.key as keyof typeof data.sections]}
                />
              ))}
            </div>

            <div className="company-section-title">Аналитика компании</div>
            <CompanyAnalyticsTiles loading={isLoading} analytics={data?.analytics} />
          </div>

          <aside className="company-grid__aside">
            <div className="company-section-title">Активность</div>
            <ActivityFeed
              loading={isLoading}
              events={data?.activity ?? []}
            />
          </aside>
        </div>
      </PageContainer>

      {/* Hidden quick-action modals */}
      <EmployeeFormDrawer
        employee={null}
        open={employeeOpen}
        onClose={() => setEmployeeOpen(false)}
      />
      <CreateBrigadeModal
        open={brigadeOpen}
        onClose={() => setBrigadeOpen(false)}
      />
    </>
  );
}

/* ============================================================ */

function KpiStrip({
  sections,
  loading,
}: {
  sections: ReturnType<typeof useCompanyHubOverview>['data'] extends infer T
    ? T extends { sections: infer S }
      ? S | undefined
      : undefined
    : undefined;
  loading: boolean;
}) {
  if (loading || !sections) {
    return <Skeleton.Node active style={{ height: 88, width: '100%' }} />;
  }
  const tiles: { key: string; label: string; value: number; icon: React.ReactNode; tone: string }[] = [
    { key: 'employees', label: 'Сотрудники', value: sections.employees.total, icon: <UserOutlined />, tone: 'blue' },
    { key: 'brigades', label: 'Бригады', value: sections.brigades.total, icon: <TeamOutlined />, tone: 'cyan' },
    { key: 'vehicles', label: 'Техника', value: sections.vehicles.total, icon: <CarOutlined />, tone: 'amber' },
    { key: 'warehouses', label: 'Склады', value: sections.warehouses.total, icon: <ShopOutlined />, tone: 'purple' },
    { key: 'suppliers', label: 'Поставщики', value: sections.suppliers.total, icon: <ContainerOutlined />, tone: 'orange' },
    { key: 'materials', label: 'Материалы', value: sections.materials.total, icon: <AppstoreOutlined />, tone: 'green' },
  ];
  return (
    <div className="company-kpi-strip">
      {tiles.map((t) => (
        <div key={t.key} className={`company-kpi company-kpi--${t.tone}`}>
          <div className="company-kpi__icon">{t.icon}</div>
          <div className="company-kpi__body">
            <div className="company-kpi__label">{t.label}</div>
            <div className="company-kpi__value">{t.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionCard({
  meta,
  data,
}: {
  meta: SectionMeta;
  data: CompanySection | undefined;
}) {
  const total = data?.total ?? null;
  return (
    <Link
      href={meta.href}
      prefetch
      className={`company-card company-card--${meta.accent}`}
    >
      <div className="company-card__head">
        <span className="company-card__icon">{meta.icon}</span>
        <div className="company-card__title">
          {meta.title}
          {total !== null && <span className="company-card__count">{total}</span>}
        </div>
        <RightOutlined className="company-card__arrow" />
      </div>
      <div className="company-card__desc">{meta.description}</div>
      {data && data.stats.length > 0 && (
        <div className="company-card__stats">
          {data.stats.map((s, i) => (
            <StatChip key={i} stat={s} />
          ))}
        </div>
      )}
    </Link>
  );
}

function StatChip({ stat }: { stat: SectionStat }) {
  const color: Record<NonNullable<SectionStat['tone']>, string> = {
    default: 'default',
    success: 'green',
    warning: 'gold',
    danger: 'red',
  };
  const tone = stat.tone ?? 'default';
  return (
    <Tag color={color[tone]} className="company-card__chip">
      <span className="company-card__chip-label">{stat.label}:</span>
      <strong>{stat.value}</strong>
    </Tag>
  );
}

function CompanyAnalyticsTiles({
  loading,
  analytics,
}: {
  loading: boolean;
  analytics: import('@entities/company/types').CompanyOverview['analytics'] | undefined;
}) {
  if (loading || !analytics) {
    return <Skeleton.Node active style={{ height: 120, width: '100%' }} />;
  }
  const tiles = [
    {
      key: 'payroll',
      icon: <DollarOutlined />,
      title: 'ФОТ в этом месяце',
      value: formatMoney(analytics.payrollAccruedThisMonth),
      sub: `Выплачено ${formatMoney(analytics.payrollPaidThisMonth)}`,
      tone: 'blue',
    },
    {
      key: 'works',
      icon: <ToolOutlined />,
      title: 'Работ бригад (30 дн)',
      value: formatMoney(analytics.worksAmount30d),
      sub: 'Эффективность по объектам',
      tone: 'cyan',
    },
    {
      key: 'fuel',
      icon: <CarOutlined />,
      title: 'Топливо и техника (30 дн)',
      value: formatMoney(analytics.fuelCost30d),
      sub: 'Расходы на эксплуатацию',
      tone: 'amber',
    },
    {
      key: 'stock',
      icon: <AppstoreOutlined />,
      title: 'Остатки на складах',
      value: formatMoney(analytics.stockValue),
      sub: 'Стоимость по средней цене',
      tone: 'purple',
    },
    {
      key: 'purchases',
      icon: <ContainerOutlined />,
      title: 'Закупки (30 дн)',
      value: formatMoney(analytics.purchases30d),
      sub: 'Сумма по поставщикам',
      tone: 'orange',
    },
  ];
  return (
    <div className="company-analytics">
      {tiles.map((t) => (
        <div key={t.key} className={`company-analytics__tile company-analytics__tile--${t.tone}`}>
          <span className="company-analytics__icon">{t.icon}</span>
          <div className="company-analytics__body">
            <div className="company-analytics__title">{t.title}</div>
            <div className="company-analytics__value">{t.value}</div>
            <div className="company-analytics__sub">{t.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityFeed({
  loading,
  events,
}: {
  loading: boolean;
  events: ActivityEvent[];
}) {
  if (loading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }
  if (events.length === 0) {
    return (
      <div className="company-activity company-activity--empty">
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Активности за 30 дней нет" />
      </div>
    );
  }
  return (
    <ul className="company-activity" aria-label="Активность компании">
      {events.map((e) => (
        <li key={e.id} className="company-activity__item">
          <span className={`company-activity__bullet company-activity__bullet--${e.kind}`}>
            <ActivityIcon kind={e.kind} />
          </span>
          <div className="company-activity__body">
            {e.href ? (
              <Link href={e.href} className="company-activity__title">
                {e.title}
              </Link>
            ) : (
              <span className="company-activity__title">{e.title}</span>
            )}
            {e.subtitle && <div className="company-activity__sub">{e.subtitle}</div>}
            <div className="company-activity__time">{formatRelative(e.at)}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ActivityIcon({ kind }: { kind: ActivityEvent['kind'] }) {
  switch (kind) {
    case 'employee_added':
      return <UserOutlined />;
    case 'brigade_created':
      return <TeamOutlined />;
    case 'supplier_added':
      return <ContainerOutlined />;
    case 'vehicle_added':
      return <CarOutlined />;
    case 'warehouse_added':
      return <ShopOutlined />;
    case 'purchase_created':
      return <ThunderboltOutlined />;
    default:
      return <AppstoreOutlined />;
  }
}

function formatRelative(iso: string): string {
  const diff = (Date.now() - +new Date(iso)) / 1000;
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} дн назад`;
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}
