'use client';

import { PageHeader } from '@shared/ui/page-header';
import { PageContainer } from '@shared/ui/page-container';
import { PageToolbar } from '@shared/ui/page-toolbar';
import { BrigadesTable } from '@widgets/brigades/brigades-table';
import { CreateBrigadeButton } from '@features/create-brigade/ui/create-brigade-button';

export default function BrigadesPage() {
  return (
    <>
      <PageHeader title="Бригады" subtitle="Состав и распределение по объектам" />
      <PageToolbar actions={<CreateBrigadeButton />} />
      <PageContainer>
        <BrigadesTable />
      </PageContainer>
    </>
  );
}
