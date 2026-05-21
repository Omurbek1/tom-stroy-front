'use client';

import { Card, Select, Space, Table, Tag, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { RcFile, UploadProps } from 'antd/es/upload';
import { useState } from 'react';
import { message } from '@shared/lib/antd-static';
import { uploadFile } from '@features/upload-document/api';
import { useCreateDocument, useDocuments } from '@entities/document/hooks';
import type { DocumentItem, DocumentKind } from '@entities/document/types';
import { formatDate } from '@shared/lib/format';

const KIND_LABEL: Record<DocumentKind, string> = {
  CONTRACT: 'Договор',
  ACT: 'Акт',
  INVOICE: 'Счёт',
  ESTIMATE: 'Смета',
  RECEIPT: 'Чек',
  PHOTO: 'Фото',
  VIDEO: 'Видео',
  OTHER: 'Другое',
};

const KIND_OPTIONS = Object.entries(KIND_LABEL).map(([value, label]) => ({ value, label }));

function formatSize(bytes: number) {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ProjectDocumentsTable({ projectId }: { projectId: string }) {
  const [kind, setKind] = useState<DocumentKind>('OTHER');
  const { data, isLoading } = useDocuments({ projectId, limit: 100 });
  const create = useCreateDocument(projectId);

  const customRequest: UploadProps['customRequest'] = async (options) => {
    const file = options.file as RcFile;
    try {
      const uploaded = await uploadFile(file, {
        kind,
        projectId,
        onProgress: (percent) => options.onProgress?.({ percent }),
      });
      await create.mutateAsync({
        projectId,
        kind,
        name: uploaded.name,
        storageKey: uploaded.storageKey,
        mime: uploaded.mime,
        sizeBytes: uploaded.size,
      });
      options.onSuccess?.(uploaded);
      message.success('Документ загружен');
    } catch (err) {
      options.onError?.(err as Error);
      message.error('Не удалось загрузить документ');
    }
  };

  const columns: ColumnsType<DocumentItem> = [
    {
      title: 'Документ',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, r) => (
        <div>
          <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{name}</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
            {r.mime ?? 'Файл'} · {formatSize(r.sizeBytes)}
          </div>
        </div>
      ),
    },
    {
      title: 'Тип',
      dataIndex: 'kind',
      key: 'kind',
      width: 130,
      render: (v: DocumentKind) => <Tag>{KIND_LABEL[v] ?? v}</Tag>,
    },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (v: string) => formatDate(v),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card
        title="Загрузка документов"
        extra={
          <Select<DocumentKind>
            value={kind}
            onChange={setKind}
            options={KIND_OPTIONS}
            style={{ width: 150 }}
          />
        }
      >
        <Upload.Dragger
          multiple
          customRequest={customRequest}
          showUploadList={false}
          disabled={create.isPending}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Перетащите файлы или нажмите для загрузки</p>
          <p className="ant-upload-hint">Договоры, акты, сметы, счета и прочие файлы объекта</p>
        </Upload.Dragger>
      </Card>

      <Card title="Документы объекта">
        <Table<DocumentItem>
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={data?.data ?? []}
          loading={isLoading}
          pagination={false}
        />
      </Card>
    </Space>
  );
}
