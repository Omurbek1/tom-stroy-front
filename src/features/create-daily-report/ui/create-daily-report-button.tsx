'use client';

import { Button, Grid, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useCallback, useState } from 'react';
import dayjs from 'dayjs';
import { useProject } from '@entities/project/hooks';
import { FormModal } from '@shared/ui/form-modal';
import { DailyReportForm } from './daily-report-form';

interface Props {
  projectId: string;
}

export function CreateDailyReportButton({ projectId }: Props) {
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const screens = Grid.useBreakpoint();
  const { data: project } = useProject(projectId);

  const width = screens.xxl ? 1180 : screens.xl ? 1040 : screens.lg ? 920 : 720;
  const today = dayjs().format('D MMMM YYYY');

  const handleDone = useCallback(() => {
    setOpen(false);
    setDirty(false);
  }, []);

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
        Отчёт прораба
      </Button>
      <FormModal
        title="Ежедневный отчёт прораба"
        subtitle={project?.name ? `${project.name} • ${today}` : today}
        badge={<Tag color="default">Черновик</Tag>}
        width={width}
        open={open}
        onClose={() => setOpen(false)}
        dirty={dirty}
      >
        <DailyReportForm
          projectId={projectId}
          onDone={handleDone}
          onDirtyChange={setDirty}
        />
      </FormModal>
    </>
  );
}
