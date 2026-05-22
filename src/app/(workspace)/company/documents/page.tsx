'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  Empty,
  Input,
  Popconfirm,
  Segmented,
  Skeleton,
  Space,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FileTextOutlined,
  FilterOutlined,
  InboxOutlined,
  PlusOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { PageHeader } from '@shared/ui/page-header';
import { PageContainer } from '@shared/ui/page-container';
import { formatDate } from '@shared/lib/format';
import { message } from '@shared/lib/antd-static';
import {
  useArchiveDocument,
  useDocuments,
  useDuplicateDocument,
  useRestoreDocument,
} from '@entities/document-builder/hooks';
import { downloadDocumentPdf } from '@entities/document-builder/api';
import {
  BUILDER_STATUS_COLOR,
  BUILDER_STATUS_LABEL,
  DOCUMENT_KIND_LABEL,
  type BuilderDocStatus,
  type BuilderDocument,
  type DocumentKind,
} from '@entities/document-builder/types';
import './documents.css';

type StatusFilter = 'ALL' | BuilderDocStatus;
type KindFilter = 'ALL' | DocumentKind;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Все' },
  { value: 'DRAFT', label: 'Черновики' },
  { value: 'PREPARED', label: 'Подготовлено' },
  { value: 'SIGNED', label: 'Подписано' },
  { value: 'ARCHIVED', label: 'Архив' },
];

const KIND_OPTIONS: { value: KindFilter; label: string }[] = [
  { value: 'ALL', label: 'Все' },
  { value: 'CONTRACT', label: 'Договоры' },
  { value: 'ACT', label: 'Акты' },
  { value: 'ESTIMATE', label: 'Сметы' },
  { value: 'INVOICE', label: 'Счета' },
  { value: 'RECEIPT', label: 'Накладные' },
];

export default function DocumentsListPage() {
  const router = useRouter();
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [kind, setKind] = useState<KindFilter>('ALL');
  const [search, setSearch] = useState('');

  const params = useMemo(
    () => ({
      status: status === 'ALL' ? undefined : status,
      kind: kind === 'ALL' ? undefined : kind,
      search: search.trim() || undefined,
      limit: 200,
    }),
    [status, kind, search],
  );

  const { data, isLoading } = useDocuments(params);
  const duplicateMutation = useDuplicateDocument();
  const archiveMutation = useArchiveDocument();
  const restoreMutation = useRestoreDocument();

  const rows = data?.data ?? [];

  const handleDownloadPdf = async (doc: BuilderDocument) => {
    try {
      await downloadDocumentPdf(doc.id, doc.name || 'document');
      message.success('PDF загружается');
    } catch {
      message.error('Не удалось скачать PDF');
    }
  };

  const handleDuplicate = async (doc: BuilderDocument) => {
    try {
      const created = await duplicateMutation.mutateAsync(doc.id);
      message.success('Документ дублирован');
      router.push(`/company/documents/${created.id}`);
    } catch {
      message.error('Не удалось дублировать');
    }
  };

  const handleArchive = async (doc: BuilderDocument) => {
    try {
      await archiveMutation.mutateAsync(doc.id);
      message.success('Документ перенесён в архив');
    } catch {
      message.error('Не удалось архивировать');
    }
  };

  const handleRestore = async (doc: BuilderDocument) => {
    try {
      await restoreMutation.mutateAsync(doc.id);
      message.success('Документ восстановлен');
    } catch {
      message.error('Не удалось восстановить');
    }
  };

  const columns: ColumnsType<BuilderDocument> = [
    {
      title: 'Номер',
      dataIndex: 'number',
      key: 'number',
      width: 120,
      render: (v: string | null) => v || '—',
    },
    {
      title: 'Название',
      key: 'name',
      ellipsis: true,
      render: (_, r) => (
        <Space size={8} wrap>
          <FileTextOutlined style={{ color: 'var(--ant-color-text-tertiary, #8c8c8c)' }} />
          <strong>{r.name}</strong>
          <Tag>{DOCUMENT_KIND_LABEL[r.kind] ?? r.kind}</Tag>
        </Space>
      ),
    },
    {
      title: 'Объект',
      key: 'project',
      ellipsis: true,
      render: (_, r) =>
        r.project ? (
          <Link
            href={`/objects/${r.project.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            {r.project.name}
          </Link>
        ) : (
          '—'
        ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (s: BuilderDocStatus) => (
        <Tag color={BUILDER_STATUS_COLOR[s] ?? 'default'}>
          {BUILDER_STATUS_LABEL[s] ?? s}
        </Tag>
      ),
    },
    {
      title: 'Создан',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      sorter: (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
      defaultSortOrder: 'descend',
      render: (v: string) => formatDate(v),
    },
    {
      title: '',
      key: 'actions',
      width: 170,
      align: 'right',
      render: (_, r) => (
        <Space size={0} onClick={(e) => e.stopPropagation()}>
          <Button
            type="text"
            size="small"
            icon={<DownloadOutlined />}
            title="Скачать PDF"
            onClick={() => handleDownloadPdf(r)}
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            title="Редактировать"
            onClick={() => router.push(`/company/documents/${r.id}`)}
          />
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            title="Дублировать"
            onClick={() => handleDuplicate(r)}
          />
          {r.status === 'ARCHIVED' ? (
            <Popconfirm
              title="Восстановить документ?"
              onConfirm={() => handleRestore(r)}
              okText="Восстановить"
              cancelText="Отмена"
            >
              <Button
                type="text"
                size="small"
                icon={<UndoOutlined />}
                title="Восстановить"
              />
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Перенести в архив?"
              onConfirm={() => handleArchive(r)}
              okButtonProps={{ danger: true }}
              okText="Архивировать"
              cancelText="Отмена"
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<InboxOutlined />}
                title="Архивировать"
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Документы"
        subtitle="Конструктор корпоративных документов и шаблонов"
        breadcrumbs={[{ href: '/company', label: 'Компания' }, { label: 'Документы' }]}
        actions={
          <Space wrap size="small">
            <Link href="/company/documents/templates">
              <Button icon={<FileTextOutlined />}>Шаблоны</Button>
            </Link>
            <Link href="/company/documents/new">
              <Button type="primary" icon={<PlusOutlined />}>
                Создать документ
              </Button>
            </Link>
          </Space>
        }
        filters={
          <Space wrap size="small">
            <Segmented<StatusFilter>
              value={status}
              onChange={(v) => setStatus(v)}
              options={STATUS_OPTIONS}
              size="small"
            />
            <Segmented<KindFilter>
              value={kind}
              onChange={(v) => setKind(v)}
              options={KIND_OPTIONS}
              size="small"
            />
            <Input
              size="small"
              prefix={<FilterOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Поиск по названию / номеру"
              style={{ width: 260 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Space>
        }
      />
      <PageContainer>
        <Card className="doc-list-card" styles={{ body: { padding: 0 } }}>
          {isLoading ? (
            <div style={{ padding: 16 }}>
              <Skeleton active paragraph={{ rows: 8 }} />
            </div>
          ) : rows.length === 0 ? (
            <div style={{ padding: 32 }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Документов пока нет"
              >
                <Link href="/company/documents/new">
                  <Button type="primary" icon={<PlusOutlined />}>
                    Создать первый документ
                  </Button>
                </Link>
              </Empty>
            </div>
          ) : (
            <Table<BuilderDocument>
              rowKey="id"
              size="middle"
              columns={columns}
              dataSource={rows}
              pagination={{ pageSize: 25, showSizeChanger: false }}
              scroll={{ x: 980 }}
              onRow={(record) => ({
                onClick: () => router.push(`/company/documents/${record.id}`),
                style: { cursor: 'pointer' },
              })}
            />
          )}
        </Card>
      </PageContainer>
    </>
  );
}
