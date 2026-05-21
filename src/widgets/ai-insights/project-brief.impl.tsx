'use client';

import { Alert, Button, Card, Space, Typography } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { useProjectBrief } from '@features/ai-prediction/hooks';

export function ProjectBriefWidget({ projectId }: { projectId: string }) {
  const mutation = useProjectBrief(projectId);

  return (
    <Card
      title={
        <Space>
          <ThunderboltOutlined />
          AI-бриф по объекту
        </Space>
      }
      extra={
        <Button
          type="primary"
          onClick={() => mutation.mutate()}
          loading={mutation.isPending}
        >
          {mutation.data ? 'Перегенерировать' : 'Получить бриф'}
        </Button>
      }
    >
      {mutation.isError && (
        <Alert
          type="error"
          message="Не удалось получить бриф"
          description="Проверьте, что ANTHROPIC_API_KEY установлен на backend."
        />
      )}
      {!mutation.data && !mutation.isError && !mutation.isPending && (
        <Typography.Text type="secondary">
          Нажмите «Получить бриф» — Claude проанализирует последние работы,
          расходы и прогресс, и предложит краткие выводы и рекомендации.
        </Typography.Text>
      )}
      {mutation.data && (
        <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
          {mutation.data}
        </Typography.Paragraph>
      )}
    </Card>
  );
}
