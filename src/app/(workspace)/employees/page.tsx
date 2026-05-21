'use client';

import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { PageHeader } from '@shared/ui/page-header';
import { PageContainer } from '@shared/ui/page-container';
import { PageSearch } from '@shared/ui/page-search';
import { PageToolbar } from '@shared/ui/page-toolbar';
import { EmployeesTable } from '@widgets/employees/employees-table';
import { EmployeeFormDrawer } from '@features/edit-employee/ui/employee-form-drawer';

export default function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <PageHeader title="Сотрудники" subtitle="Состав и ставки" />
      <PageToolbar
        search={
          <PageSearch
            placeholder="Поиск сотрудника..."
            value={search}
            onSearch={setSearch}
            onClear={() => setSearch('')}
          />
        }
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            Новый сотрудник
          </Button>
        }
      />
      <PageContainer>
        <EmployeesTable search={search} />
      </PageContainer>
      <EmployeeFormDrawer
        employee={null}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </>
  );
}
