'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Button,
  Card,
  Collapse,
  Dropdown,
  Form,
  Input,
  Popconfirm,
  Skeleton,
  Space,
  Tag,
} from 'antd';
import {
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EllipsisOutlined,
  HistoryOutlined,
  InboxOutlined,
  MoreOutlined,
  PlusOutlined,
  PrinterOutlined,
  SaveOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { PageHeader } from '@shared/ui/page-header';
import { PageContainer } from '@shared/ui/page-container';
import { formatDate } from '@shared/lib/format';
import { message } from '@shared/lib/antd-static';
import { MarkdownPreview } from '@widgets/document-preview/markdown-preview';
import { RichDocEditor } from '@widgets/document-editor/rich-doc-editor';
import {
  useArchiveDocument,
  useDeleteDocument,
  useDocument,
  useDocumentVersions,
  useDuplicateDocument,
  useRestoreDocument,
  useUpdateDocument,
} from '@entities/document-builder/hooks';
import { downloadDocumentPdf } from '@entities/document-builder/api';
import {
  BUILDER_STATUS_COLOR,
  BUILDER_STATUS_LABEL,
  DOCUMENT_KIND_LABEL,
  type BuilderDocStatus,
  type BuilderDocumentSignature,
} from '@entities/document-builder/types';
import '../documents.css';

const STATUS_CHOICES: { key: BuilderDocStatus; label: string }[] = [
  { key: 'DRAFT', label: 'Черновик' },
  { key: 'PREPARED', label: 'Подготовлен' },
  { key: 'SIGNED', label: 'Подписан' },
  { key: 'SENT', label: 'Отправлен' },
  { key: 'ARCHIVED', label: 'Архив' },
];

export default function EditDocumentPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(props.params);
  const router = useRouter();

  const { data: doc, isLoading } = useDocument(id);
  const { data: versions } = useDocumentVersions(id);
  const updateMutation = useUpdateDocument();
  const duplicateMutation = useDuplicateDocument();
  const archiveMutation = useArchiveDocument();
  const restoreMutation = useRestoreDocument();
  const deleteMutation = useDeleteDocument();

  // Local editable state, synced from server on load
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [signatures, setSignatures] = useState<BuilderDocumentSignature[]>([]);
  const [signName, setSignName] = useState('');
  const [signRole, setSignRole] = useState('');

  useEffect(() => {
    if (!doc) return;
    setName(doc.name);
    setContent(doc.content);
    setSignatures(doc.signatures ?? []);
  }, [doc]);

  const dirty = useMemo(() => {
    if (!doc) return false;
    return (
      name !== doc.name ||
      content !== doc.content ||
      JSON.stringify(signatures) !== JSON.stringify(doc.signatures ?? [])
    );
  }, [doc, name, content, signatures]);

  const previewValues = useMemo(
    () => (doc?.meta ?? {}) as Record<string, string | number>,
    [doc],
  );

  const handleSave = async () => {
    if (!doc) return;
    try {
      await updateMutation.mutateAsync({
        id: doc.id,
        payload: { name, content, signatures },
      });
      message.success('Сохранено');
    } catch {
      message.error('Не удалось сохранить');
    }
  };

  const handleStatusChange = async (status: BuilderDocStatus) => {
    if (!doc) return;
    try {
      await updateMutation.mutateAsync({ id: doc.id, payload: { status } });
      message.success(`Статус: ${BUILDER_STATUS_LABEL[status]}`);
    } catch {
      message.error('Не удалось изменить статус');
    }
  };

  const handleDownloadPdf = async () => {
    if (!doc) return;
    try {
      await downloadDocumentPdf(doc.id, doc.name || 'document');
      message.success('PDF загружается');
    } catch {
      message.error('Не удалось скачать PDF');
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  const handleDuplicate = async () => {
    if (!doc) return;
    try {
      const created = await duplicateMutation.mutateAsync(doc.id);
      message.success('Документ дублирован');
      router.push(`/company/documents/${created.id}`);
    } catch {
      message.error('Не удалось дублировать');
    }
  };

  const handleArchive = async () => {
    if (!doc) return;
    try {
      await archiveMutation.mutateAsync(doc.id);
      message.success('Документ перенесён в архив');
    } catch {
      message.error('Не удалось архивировать');
    }
  };

  const handleRestore = async () => {
    if (!doc) return;
    try {
      await restoreMutation.mutateAsync(doc.id);
      message.success('Документ восстановлен');
    } catch {
      message.error('Не удалось восстановить');
    }
  };

  const handleDelete = async () => {
    if (!doc) return;
    try {
      await deleteMutation.mutateAsync(doc.id);
      message.success('Документ удалён');
      router.push('/company/documents');
    } catch {
      message.error('Не удалось удалить');
    }
  };

  const addSignature = () => {
    if (!signName.trim()) {
      message.warning('Укажите ФИО подписанта');
      return;
    }
    setSignatures((cur) => [
      ...cur,
      {
        name: signName.trim(),
        role: signRole.trim() || undefined,
        signedAt: new Date().toISOString(),
      },
    ]);
    setSignName('');
    setSignRole('');
  };

  const removeSignature = (i: number) =>
    setSignatures((cur) => cur.filter((_, j) => j !== i));

  if (isLoading || !doc) {
    return (
      <>
        <PageHeader
          title="Документ"
          breadcrumbs={[
            { href: '/company', label: 'Компания' },
            { href: '/company/documents', label: 'Документы' },
            { label: 'Загрузка…' },
          ]}
        />
        <PageContainer>
          <Skeleton active paragraph={{ rows: 12 }} />
        </PageContainer>
      </>
    );
  }

  const statusMenuItems = STATUS_CHOICES.filter((s) => s.key !== doc.status).map(
    (s) => ({
      key: `status:${s.key}`,
      label: `Статус → ${s.label}`,
      onClick: () => handleStatusChange(s.key),
    }),
  );

  const moreItems = [
    {
      key: 'duplicate',
      icon: <CopyOutlined />,
      label: 'Дублировать',
      onClick: handleDuplicate,
    },
    { type: 'divider' as const },
    ...statusMenuItems,
    { type: 'divider' as const },
    doc.status === 'ARCHIVED'
      ? {
          key: 'restore',
          icon: <UndoOutlined />,
          label: 'Восстановить из архива',
          onClick: handleRestore,
        }
      : {
          key: 'archive',
          icon: <InboxOutlined />,
          label: 'Архивировать',
          onClick: handleArchive,
        },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      danger: true,
      label: 'Удалить документ',
      onClick: () => {
        // Use modal confirm for destructive action
        if (window.confirm('Удалить документ?')) handleDelete();
      },
    },
  ];

  return (
    <>
      <PageHeader
        title={doc.name}
        subtitle={
          <Space size={8} wrap>
            <Tag>{DOCUMENT_KIND_LABEL[doc.kind] ?? doc.kind}</Tag>
            <Tag color={BUILDER_STATUS_COLOR[doc.status]}>
              {BUILDER_STATUS_LABEL[doc.status]}
            </Tag>
            {doc.number && (
              <span style={{ color: 'var(--color-text-muted, #8c8c8c)' }}>
                {doc.number}
              </span>
            )}
          </Space>
        }
        breadcrumbs={[
          { href: '/company', label: 'Компания' },
          { href: '/company/documents', label: 'Документы' },
          { label: doc.name },
        ]}
        actions={
          <Space size="small" wrap>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              Печать
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleDownloadPdf}>
              PDF
            </Button>
            <Dropdown menu={{ items: moreItems }} placement="bottomRight">
              <Button icon={<MoreOutlined />}>Ещё</Button>
            </Dropdown>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={updateMutation.isPending}
              disabled={!dirty}
              onClick={handleSave}
            >
              Сохранить
            </Button>
          </Space>
        }
      />
      <PageContainer>
        <div className="doc-builder">
          <div className="doc-builder__form">
            <Card title="Метаданные" size="small">
              <dl className="doc-builder__meta-row">
                <dt>Номер</dt>
                <dd>{doc.number ?? '—'}</dd>
                <dt>Тип</dt>
                <dd>{DOCUMENT_KIND_LABEL[doc.kind] ?? doc.kind}</dd>
                <dt>Объект</dt>
                <dd>
                  {doc.project ? (
                    <Link href={`/objects/${doc.project.id}`}>{doc.project.name}</Link>
                  ) : (
                    '—'
                  )}
                </dd>
                <dt>Шаблон</dt>
                <dd>{doc.template?.name ?? '—'}</dd>
                <dt>Создан</dt>
                <dd>{formatDate(doc.createdAt)}</dd>
                <dt>Обновлён</dt>
                <dd>{formatDate(doc.updatedAt)}</dd>
              </dl>
            </Card>

            <Card title="Название и содержимое" size="small" style={{ marginTop: 12 }}>
              <Form layout="vertical" component="div">
                <Form.Item label="Название" required>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Название документа"
                  />
                </Form.Item>
                <Form.Item
                  label="Содержимое"
                  help={
                    <span style={{ fontSize: 11 }}>
                      Word-подобный редактор: жирный/курсив (⌘B / ⌘I), заголовки,
                      списки, таблицы, ссылки. Плейсхолдеры{' '}
                      <code>{'{{var}}'}</code> подсвечиваются оранжевым.
                    </span>
                  }
                >
                  <RichDocEditor value={content} onChange={setContent} />
                </Form.Item>
              </Form>
            </Card>

            <Collapse
              size="small"
              style={{ marginTop: 12 }}
              defaultActiveKey={signatures.length > 0 ? ['sigs'] : []}
              items={[
                {
                  key: 'sigs',
                  label: (
                    <Space size={8}>
                      <span>Подписи</span>
                      <Tag>{signatures.length}</Tag>
                    </Space>
                  ),
                  children: (
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      {signatures.length === 0 ? (
                        <Alert
                          type="info"
                          showIcon
                          message="Подписи пока не добавлены"
                          description="Добавляйте подписантов поэтапно — сотрудник, прораб, заказчик."
                        />
                      ) : (
                        signatures.map((s, i) => (
                          <div key={i} className="doc-signature-row">
                            <div>
                              <strong>{s.name}</strong>
                              {s.role && (
                                <span style={{ color: '#8c8c8c', marginLeft: 6 }}>
                                  · {s.role}
                                </span>
                              )}
                              {s.signedAt && (
                                <div style={{ fontSize: 11, color: '#bfbfbf' }}>
                                  {formatDate(s.signedAt)}
                                </div>
                              )}
                            </div>
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => removeSignature(i)}
                            />
                          </div>
                        ))
                      )}
                      <Space.Compact style={{ width: '100%' }}>
                        <Input
                          placeholder="ФИО"
                          value={signName}
                          onChange={(e) => setSignName(e.target.value)}
                        />
                        <Input
                          placeholder="Роль (опц.)"
                          value={signRole}
                          onChange={(e) => setSignRole(e.target.value)}
                        />
                        <Button icon={<PlusOutlined />} onClick={addSignature}>
                          Добавить
                        </Button>
                      </Space.Compact>
                    </Space>
                  ),
                },
                {
                  key: 'versions',
                  label: (
                    <Space size={8}>
                      <HistoryOutlined />
                      <span>История версий</span>
                      <Tag>{versions?.length ?? 0}</Tag>
                    </Space>
                  ),
                  children:
                    !versions || versions.length === 0 ? (
                      <Alert
                        type="info"
                        showIcon
                        message="Версий пока нет"
                      />
                    ) : (
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        {versions.map((v) => (
                          <div key={v.id} className="doc-version-row">
                            <Tag color="default">v{v.version}</Tag>
                            <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                              {formatDate(v.createdAt)}
                              {v.changedBy && ` · ${v.changedBy}`}
                            </span>
                          </div>
                        ))}
                      </Space>
                    ),
                },
              ]}
            />
          </div>

          <div className="doc-builder__preview">
            <div className="doc-page" aria-label="Предпросмотр документа A4">
              <MarkdownPreview content={content} values={previewValues} />
              {signatures.length > 0 && (
                <div className="doc-page__signatures">
                  {signatures.map((s, i) => (
                    <div key={i} className="doc-page__sig">
                      <div className="doc-page__sig-line">_______________________</div>
                      <div className="doc-page__sig-name">{s.name}</div>
                      {s.role && <div className="doc-page__sig-role">{s.role}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
