'use client';

import { Empty, Card } from 'antd';
import { PageHeader } from './page-header';

export function ComingSoon({ title, hint }: { title: string; hint?: string }) {
  return (
    <>
      <PageHeader title={title} subtitle={hint} />
      <Card>
        <Empty description="Модуль в разработке" />
      </Card>
    </>
  );
}
