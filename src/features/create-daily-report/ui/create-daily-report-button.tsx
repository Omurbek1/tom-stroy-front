'use client';

import { Button, Drawer, Grid, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import dayjs from 'dayjs';
import { useProject } from '@entities/project/hooks';
import { DailyReportForm } from './daily-report-form';

interface Props {
  projectId: string;
}

export function CreateDailyReportButton({ projectId }: Props) {
  const [open, setOpen] = useState(false);
  const screens = Grid.useBreakpoint();
  const { data: project } = useProject(projectId);

  const width = screens.lg ? 900 : screens.md ? 720 : '100%';

  const today = dayjs().format('D MMMM YYYY');
  const projectName = project?.name;

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
        Отчёт прораба
      </Button>
      <Drawer
        title={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>Ежедневный отчёт прораба</span>
            <span style={{ fontSize: 12, color: 'var(--ant-color-text-secondary, #8c8c8c)' }}>
              {projectName ? `${projectName} • ${today}` : today}
            </span>
          </div>
        }
        extra={<Tag color="default">Черновик</Tag>}
        width={width}
        open={open}
        onClose={() => setOpen(false)}
        destroyOnClose
        styles={{
          body: { paddingBottom: 0 },
          header: { padding: '14px 20px' },
        }}
      >
        <DailyReportForm projectId={projectId} onDone={() => setOpen(false)} />
      </Drawer>
    </>
  );
}
