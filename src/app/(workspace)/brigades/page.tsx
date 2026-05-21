'use client';

import { PageHeader } from '@shared/ui/page-header';
import { PageContainer } from '@shared/ui/page-container';
import { BrigadesTable } from '@widgets/brigades/brigades-table';

export default function BrigadesPage() {
  return (
    <>
      <PageHeader title="Бригады" subtitle="Состав и распределение по объектам" />
      <PageContainer>
        <BrigadesTable />
      </PageContainer>
    </>
  );
}
