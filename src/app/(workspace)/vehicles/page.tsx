'use client';

import { Tabs } from 'antd';
import { PageHeader } from '@shared/ui/page-header';
import { VehiclesTable } from '@widgets/vehicles/vehicles-table';
import { UsagesTable } from '@widgets/vehicles/usages-table';

export default function VehiclesPage() {
  return (
    <>
      <PageHeader title="Техника" subtitle="Парк и история использования" />
      <Tabs
        defaultActiveKey="fleet"
        items={[
          { key: 'fleet', label: 'Парк', children: <VehiclesTable /> },
          { key: 'usages', label: 'Использование', children: <UsagesTable /> },
        ]}
      />
    </>
  );
}
