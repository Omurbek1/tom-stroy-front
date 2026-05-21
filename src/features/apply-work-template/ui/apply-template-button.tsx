'use client';

import { Button, Empty, Modal, Skeleton, Tag } from 'antd';
import { ApartmentOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useWorkTemplates } from '@entities/work-template/hooks';
import type { WorkTemplate } from '@entities/work-template/types';
import { formatWorkType } from '@shared/constants/work-type';
import { formatWorkUnit } from '@shared/constants/work-unit';
import { formatMoney, formatNumber } from '@shared/lib/format';

interface Props {
  brigadeId?: string;
  onApply: (tpl: WorkTemplate) => void;
}

export function ApplyTemplateButton({ brigadeId, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useWorkTemplates(brigadeId);

  const templates = data ?? [];

  return (
    <>
      <Button
        size="small"
        icon={<ApartmentOutlined />}
        onClick={() => setOpen(true)}
      >
        Шаблоны
      </Button>
      <Modal
        open={open}
        title="Шаблоны работ"
        footer={null}
        onCancel={() => setOpen(false)}
        width={560}
      >
        {isLoading ? (
          <Skeleton active />
        ) : templates.length === 0 ? (
          <Empty description="Шаблонов пока нет. Создаются в настройках." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onApply(t);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: 'var(--ant-color-bg-container, #fff)',
                  border: '1px solid var(--ant-color-border-secondary, #f0f0f0)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{t.name}</div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--ant-color-text-secondary, #8c8c8c)',
                    }}
                  >
                    {formatWorkType(t.workType)}
                    {t.brigade && ` • ${t.brigade.name}`}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {t.typicalVolume != null && (
                    <Tag>
                      {formatNumber(t.typicalVolume)} {formatWorkUnit(t.unit)}
                    </Tag>
                  )}
                  <Tag color="blue">{formatMoney(t.defaultPrice)}</Tag>
                </div>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
