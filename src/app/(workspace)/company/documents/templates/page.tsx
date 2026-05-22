'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  Empty,
  Input,
  Segmented,
  Skeleton,
  Space,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  FileTextOutlined,
  FilterOutlined,
  PlusOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { PageHeader } from '@shared/ui/page-header';
import { PageContainer } from '@shared/ui/page-container';
import { formatDate } from '@shared/lib/format';
import { useTemplates } from '@entities/document-builder/hooks';
import {
  DOCUMENT_KIND_LABEL,
  type DocumentKind,
  type DocumentTemplate,
} from '@entities/document-builder/types';
import '../documents.css';

type KindFilter = 'ALL' | DocumentKind;

const KIND_OPTIONS: { value: KindFilter; label: string }[] = [
  { value: 'ALL', label: 'Все' },
  { value: 'CONTRACT', label: 'Договоры' },
  { value: 'ACT', label: 'Акты' },
  { value: 'ESTIMATE', label: 'Сметы' },
  { value: 'INVOICE', label: 'Счета' },
  { value: 'RECEIPT', label: 'Накладные' },
];

export default function TemplatesListPage() {
  const router = useRouter();
  const [kind, setKind] = useState<KindFilter>('ALL');
  const [search, setSearch] = useState('');

  const params = useMemo(
    () => ({
      kind: kind === 'ALL' ? undefined : kind,
      search: search.trim() || undefined,
      limit: 200,
    }),
    [kind, search],
  );
  const { data, isLoading } = useTemplates(params);

  const rows = data?.data ?? [];

  const columns: ColumnsType<DocumentTemplate> = [
    {
      title: 'Название',
      key: 'name',
      render: (_, r) => (
        <Space size={8}>
          <FileTextOutlined style={{ color: 'var(--ant-color-text-tertiary, #8c8c8c)' }} />
          <strong>{r.name}</strong>
          {r.isDefault && <Tag color="blue">Системный</Tag>}
        </Space>
      ),
    },
    {
      title: 'Тип',
      dataIndex: 'kind',
      key: 'kind',
      width: 140,
      render: (k: DocumentKind) => <Tag>{DOCUMENT_KIND_LABEL[k] ?? k}</Tag>,
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (v: string | null) => v || '—',
    },
    {
      title: 'Обновлён',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 120,
      sorter: (a, b) => +new Date(a.updatedAt) - +new Date(b.updatedAt),
      defaultSortOrder: 'descend',
      render: (v: string) => formatDate(v),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      align: 'right',
      render: () => <RightOutlined style={{ color: '#bfbfbf' }} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Шаблоны документов"
        subtitle="Готовые формы — нажмите, чтобы создать документ на основе шаблона"
        breadcrumbs={[
          { href: '/company', label: 'Компания' },
          { href: '/company/documents', label: 'Документы' },
          { label: 'Шаблоны' },
        ]}
        actions={
          <Link href="/company/documents/new">
            <Button type="primary" icon={<PlusOutlined />}>
              Создать документ
            </Button>
          </Link>
        }
        filters={
          <Space wrap size="small">
            <Segmented<KindFilter>
              value={kind}
              onChange={(v) => setKind(v)}
              options={KIND_OPTIONS}
              size="small"
            />
            <Input
              size="small"
              prefix={<FilterOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Поиск по названию"
              style={{ width: 240 }}
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
              <Skeleton active paragraph={{ rows: 6 }} />
            </div>
          ) : rows.length === 0 ? (
            <div style={{ padding: 32 }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Шаблонов нет"
              />
            </div>
          ) : (
            <Table<DocumentTemplate>
              rowKey="id"
              size="middle"
              columns={columns}
              dataSource={rows}
              pagination={{ pageSize: 25, showSizeChanger: false }}
              onRow={(record) => ({
                onClick: () =>
                  router.push(`/company/documents/new?templateId=${record.id}`),
                style: { cursor: 'pointer' },
              })}
            />
          )}
        </Card>
      </PageContainer>
    </>
  );
}
