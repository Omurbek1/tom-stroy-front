'use client';

import { Button, Dropdown } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { message } from '@shared/lib/antd-static';
import { downloadFile } from '@shared/lib/download';
import { apiRoutes } from '@shared/api/routes';

interface Props {
  /** Scopes all exports to this project when provided. */
  projectId?: string;
}

export function ExportWarehouseButton({ projectId }: Props = {}) {
  const [downloading, setDownloading] = useState(false);

  const today = () => new Date().toISOString().slice(0, 10);
  const scopedParams = (extra: Record<string, unknown>) =>
    projectId ? { ...extra, projectId } : extra;
  const scopedName = (base: string) =>
    projectId ? `${base}_obj-${projectId.slice(0, 6)}_${today()}` : `${base}_${today()}`;

  const download = async (
    url: string,
    params: Record<string, unknown>,
    filename: string,
  ) => {
    setDownloading(true);
    try {
      await downloadFile(url, params, filename);
    } catch {
      message.error('Не удалось скачать файл');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items: [
          { key: 'balances', label: 'Остатки' },
          { key: 'movements', label: 'Движение материалов' },
          { key: 'purchases', label: 'Закупки' },
        ],
        onClick: ({ key }) => {
          if (key === 'balances') {
            download(
              apiRoutes.inventory.reportsBalancesXlsx,
              scopedParams({}),
              `${scopedName('balances')}.xlsx`,
            );
          } else if (key === 'movements') {
            const from = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
            const to = new Date().toISOString();
            download(
              apiRoutes.inventory.reportsMovementsXlsx,
              scopedParams({ from, to }),
              `${scopedName('movements')}.xlsx`,
            );
          } else if (key === 'purchases') {
            const from = new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString();
            const to = new Date().toISOString();
            download(
              apiRoutes.inventory.reportsPurchasesXlsx,
              scopedParams({ from, to }),
              `${scopedName('purchases')}.xlsx`,
            );
          }
        },
      }}
    >
      <Button icon={<DownloadOutlined />} loading={downloading}>
        Excel
      </Button>
    </Dropdown>
  );
}
