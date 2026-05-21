'use client';

import { Button } from 'antd';
import { message } from '@shared/lib/antd-static';
import { DownloadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { downloadFile } from '@shared/lib/download';
import { apiRoutes } from '@shared/api/routes';

interface Props {
  from: string;
  to: string;
  projectId?: string;
  label?: string;
}

export function ExportPnlButton({ from, to, projectId, label = 'P&L Excel' }: Props) {
  const [loading, setLoading] = useState(false);
  const onClick = async () => {
    setLoading(true);
    try {
      await downloadFile(apiRoutes.reports.pnlXlsx, { from, to, projectId }, 'pnl.xlsx');
    } catch {
      message.error('Не удалось скачать файл');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button icon={<DownloadOutlined />} onClick={onClick} loading={loading}>
      {label}
    </Button>
  );
}
