'use client';

import { Button, Drawer } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { DailyReportForm } from './daily-report-form';

export function CreateDailyReportButton({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
        Отчёт прораба
      </Button>
      <Drawer
        title="Ежедневный отчёт прораба"
        width={760}
        open={open}
        onClose={() => setOpen(false)}
        destroyOnClose
      >
        <DailyReportForm projectId={projectId} onDone={() => setOpen(false)} />
      </Drawer>
    </>
  );
}
