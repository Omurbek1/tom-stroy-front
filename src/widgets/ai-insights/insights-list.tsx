'use client';

import { Alert, Button, Card, Empty, List, Popconfirm, Skeleton, Space, Tag } from 'antd';
import { message } from '@shared/lib/antd-static';
import { DeleteOutlined, ReloadOutlined, ThunderboltOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useClearInsights, useInsights, useRunInsightsScan } from '@entities/ai-insight/hooks';
import type { AiInsight, InsightKind } from '@entities/ai-insight/types';
import { formatDate } from '@shared/lib/format';

const KIND_META: Record<InsightKind, { label: string; type: 'error' | 'warning' | 'info' }> = {
  'risk-overdue': { label: 'Просрочен', type: 'error' },
  'risk-lagging': { label: 'Отставание', type: 'warning' },
  'risk-overrun': { label: 'Перерасход', type: 'error' },
  'risk-no-reports': { label: 'Нет отчётов', type: 'warning' },
  'risk-low-velocity': { label: 'Низкая скорость', type: 'warning' },
  brief: { label: 'AI-бриф', type: 'info' },
};

function severityFor(kind: string): 'error' | 'warning' | 'info' {
  return KIND_META[kind as InsightKind]?.type ?? 'info';
}

function InsightRow({ item, showProject }: { item: AiInsight; showProject: boolean }) {
  const sev = severityFor(item.kind);
  const meta = KIND_META[item.kind as InsightKind];
  const label = meta?.label ?? item.kind;
  const recommendation =
    typeof item.payload === 'object' &&
    item.payload !== null &&
    typeof (item.payload as Record<string, unknown>).recommendation === 'string'
      ? ((item.payload as Record<string, unknown>).recommendation as string)
      : null;

  return (
    <List.Item>
      <Alert
        style={{ width: '100%' }}
        type={sev}
        showIcon
        message={
          <Space wrap>
            <Tag color={sev === 'error' ? 'red' : sev === 'warning' ? 'gold' : 'blue'}>{label}</Tag>
            {showProject && item.project && (
              <Link href={`/objects/${item.project.id}`}>{item.project.name}</Link>
            )}
            <span style={{ color: '#888' }}>{formatDate(item.createdAt)}</span>
          </Space>
        }
        description={
          <div>
            <div>{item.summary}</div>
            {recommendation && (
              <div
                style={{
                  marginTop: 6,
                  padding: '6px 10px',
                  background: 'rgba(22,119,255,0.08)',
                  borderLeft: '3px solid #1677ff',
                  borderRadius: 4,
                  fontStyle: 'italic',
                }}
              >
                <strong>AI:</strong> {recommendation}
              </div>
            )}
          </div>
        }
      />
    </List.Item>
  );
}

interface Props {
  projectId?: string;
  title?: string;
  canScan?: boolean;
}

export function InsightsList({ projectId, title = 'AI-инсайты', canScan = false }: Props) {
  const { data, isLoading, refetch } = useInsights({
    projectId,
    validOnly: true,
    limit: 30,
  });
  const scan = useRunInsightsScan();
  const clear = useClearInsights();

  const onScan = async () => {
    try {
      const result = await scan.mutateAsync();
      message.success(`Сканирование: ${result.scanned} объектов, найдено ${result.created} проблем`);
    } catch {
      message.error('Не удалось запустить сканирование');
    }
  };

  const onClear = async () => {
    try {
      const result = await clear.mutateAsync({ projectId });
      message.success(`Очищено инсайтов: ${result.deleted}`);
    } catch {
      message.error('Не удалось очистить инсайты');
    }
  };

  const items = data?.data ?? [];

  return (
    <Card
      title={
        <Space>
          <ThunderboltOutlined />
          {title}
        </Space>
      }
      extra={
        <Space>
          <Button size="small" icon={<ReloadOutlined />} onClick={() => refetch()} />
          {items.length > 0 && (
            <Popconfirm
              title="Очистить AI-инсайты?"
              description={
                projectId
                  ? 'Будут удалены инсайты только этого объекта.'
                  : 'Будут удалены все сохранённые AI-инсайты.'
              }
              okText="Очистить"
              cancelText="Отмена"
              okButtonProps={{ danger: true }}
              onConfirm={onClear}
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={clear.isPending}
              >
                Очистить
              </Button>
            </Popconfirm>
          )}
          {canScan && (
            <Button
              size="small"
              type="primary"
              onClick={onScan}
              loading={scan.isPending}
            >
              Сканировать
            </Button>
          )}
        </Space>
      }
    >
      {isLoading ? (
        <Skeleton active />
      ) : items.length === 0 ? (
        <Empty description="Активных рисков не обнаружено" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List dataSource={items} renderItem={(it) => <InsightRow item={it} showProject={!projectId} />} />
      )}
    </Card>
  );
}
