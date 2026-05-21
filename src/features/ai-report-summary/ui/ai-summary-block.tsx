'use client';

import { Alert, Button, Skeleton, Tag } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { useSummarizeReport } from '@entities/ai-insight/hooks';
import type { SummarizeReportInput } from '@entities/ai-insight/api';

interface Props {
  buildInput: () => SummarizeReportInput | null;
}

export function AiSummaryBlock({ buildInput }: Props) {
  const mutation = useSummarizeReport();
  const result = mutation.data;

  const onClick = () => {
    const input = buildInput();
    if (!input) return;
    mutation.mutate(input);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--ant-color-text-secondary, #8c8c8c)' }}>
          AI оценит резюме дня и подсветит риски на основе текущего черновика.
        </div>
        <Button
          icon={<ThunderboltOutlined />}
          onClick={onClick}
          loading={mutation.isPending}
        >
          Получить AI-резюме
        </Button>
      </div>

      {mutation.isError && (
        <Alert
          type="error"
          showIcon
          style={{ marginTop: 12 }}
          message="Не удалось получить AI-резюме"
        />
      )}

      {mutation.isPending && <Skeleton active style={{ marginTop: 12 }} paragraph={{ rows: 3 }} />}

      {result && (
        <div style={{ marginTop: 12 }}>
          {result.summary && (
            <div
              style={{
                padding: '10px 12px',
                background: 'rgba(22,119,255,0.06)',
                borderLeft: '3px solid #1677ff',
                borderRadius: 4,
                marginBottom: 8,
                fontStyle: 'italic',
              }}
            >
              {result.summary}
            </div>
          )}
          {result.risks.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {result.risks.map((r, i) => (
                <Tag color="gold" key={i} style={{ whiteSpace: 'normal', lineHeight: 1.4 }}>
                  ⚠ {r}
                </Tag>
              ))}
            </div>
          )}
          {result.risks.length === 0 && result.summary && (
            <Tag color="green">Критичных рисков не обнаружено</Tag>
          )}
        </div>
      )}
    </div>
  );
}
