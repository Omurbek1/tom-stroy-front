'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  Segmented,
  Select,
  Skeleton,
  Space,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { PageHeader } from '@shared/ui/page-header';
import { PageContainer } from '@shared/ui/page-container';
import { ProjectSelect } from '@shared/ui/project-select';
import { message } from '@shared/lib/antd-static';
import { MarkdownPreview } from '@widgets/document-preview/markdown-preview';
import { RichDocEditor } from '@widgets/document-editor/rich-doc-editor';
import {
  useCreateDocument,
  useTemplate,
  useTemplates,
} from '@entities/document-builder/hooks';
import {
  DOCUMENT_KIND_LABEL,
  DOCUMENT_KIND_ORDER,
  type DocumentKind,
  type DocumentTemplate,
  type TemplateVariable,
} from '@entities/document-builder/types';
import '../documents.css';

type Mode = 'TEMPLATE' | 'BLANK';

const BLANK_CONTENT_BY_KIND: Record<DocumentKind, string> = {
  CONTRACT: '# Договор\n\nГород ___________\n\nДата ___________\n\n## Стороны\n\n- Заказчик: \n- Подрядчик: \n\n## Предмет договора\n\n',
  ACT: '# Акт выполненных работ\n\n## Стороны\n\n- Заказчик: \n- Подрядчик: \n\n## Выполненные работы\n\n- \n',
  ESTIMATE: '# Смета\n\nОбъект: \n\nДата: \n\n## Состав работ\n\n- \n',
  INVOICE: '# Счёт на оплату\n\nОт: \n\nКому: \n\n## Позиции\n\n- \n',
  RECEIPT: '# Накладная\n\nОт: \n\nКому: \n\n## Позиции\n\n- \n',
  OTHER: '# Документ\n\n',
};

function NewDocumentPageInner() {
  const router = useRouter();
  const search = useSearchParams();
  const initialTemplateId = search.get('templateId') ?? undefined;
  const initialProjectId = search.get('projectId') ?? undefined;

  const [mode, setMode] = useState<Mode>(initialTemplateId ? 'TEMPLATE' : 'TEMPLATE');
  const [templateId, setTemplateId] = useState<string | undefined>(initialTemplateId);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<DocumentKind>('CONTRACT');
  const [projectId, setProjectId] = useState<string | undefined>(initialProjectId);
  const [variableValues, setVariableValues] = useState<
    Record<string, string | number>
  >({});
  const [debouncedValues, setDebouncedValues] = useState<
    Record<string, string | number>
  >({});
  const [blankContent, setBlankContent] = useState<string>(
    BLANK_CONTENT_BY_KIND['CONTRACT'],
  );

  const { data: templatesPage, isLoading: templatesLoading } = useTemplates({ limit: 200 });
  const { data: template, isLoading: templateLoading } = useTemplate(templateId);
  const createMutation = useCreateDocument();

  // Apply template defaults when a template is selected
  useEffect(() => {
    if (!template) return;
    setName((cur) => cur || template.name);
    setKind(template.kind);
  }, [template]);

  // Switching to blank mode → seed a starter content block per kind
  useEffect(() => {
    if (mode === 'BLANK') {
      setBlankContent((cur) => cur || BLANK_CONTENT_BY_KIND[kind]);
    }
  }, [mode, kind]);

  // Debounce live preview updates (200ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValues(variableValues), 200);
    return () => clearTimeout(t);
  }, [variableValues]);

  const templateOptions = useMemo(() => {
    const list = templatesPage?.data ?? [];
    const groups = new Map<DocumentKind, DocumentTemplate[]>();
    for (const tpl of list) {
      const arr = groups.get(tpl.kind) ?? [];
      arr.push(tpl);
      groups.set(tpl.kind, arr);
    }
    return DOCUMENT_KIND_ORDER.filter((k) => groups.has(k)).map((k) => ({
      label: DOCUMENT_KIND_LABEL[k],
      title: DOCUMENT_KIND_LABEL[k],
      options: (groups.get(k) ?? []).map((t) => ({ value: t.id, label: t.name })),
    }));
  }, [templatesPage]);

  const previewContent = useMemo(() => {
    if (mode === 'BLANK') return blankContent;
    return template?.content ?? '';
  }, [mode, blankContent, template]);

  const previewValues = useMemo(() => debouncedValues, [debouncedValues]);

  const handleSave = async () => {
    if (!name.trim()) {
      message.warning('Укажите название документа');
      return;
    }
    try {
      const created = await createMutation.mutateAsync({
        name: name.trim(),
        kind,
        projectId,
        templateId: mode === 'TEMPLATE' ? templateId : undefined,
        content: mode === 'BLANK' ? blankContent : undefined,
        meta:
          Object.keys(variableValues).length > 0 ? variableValues : undefined,
      });
      message.success('Документ создан');
      router.replace(`/company/documents/${created.id}`);
    } catch {
      message.error('Не удалось создать документ');
    }
  };

  return (
    <>
      <PageHeader
        title="Новый документ"
        subtitle="Заполните параметры и проверьте предпросмотр перед сохранением"
        breadcrumbs={[
          { href: '/company', label: 'Компания' },
          { href: '/company/documents', label: 'Документы' },
          { label: 'Новый' },
        ]}
        actions={
          <Space size="small">
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
              Отмена
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createMutation.isPending}
              onClick={handleSave}
            >
              Сохранить
            </Button>
          </Space>
        }
      />
      <PageContainer>
        <div className="doc-builder">
          <Card className="doc-builder__form" title="Параметры">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Segmented<Mode>
                block
                value={mode}
                onChange={(v) => setMode(v)}
                options={[
                  { value: 'TEMPLATE', label: 'Из шаблона' },
                  { value: 'BLANK', label: 'Пустой' },
                ]}
              />

              {mode === 'TEMPLATE' && (
                <Form layout="vertical" component="div">
                  <Form.Item label="Шаблон" required>
                    <Select<string>
                      showSearch
                      allowClear
                      placeholder="Выберите шаблон"
                      value={templateId}
                      onChange={(v) => setTemplateId(v || undefined)}
                      loading={templatesLoading}
                      options={templateOptions}
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>
                </Form>
              )}

              <Form layout="vertical" component="div">
                <Form.Item label="Название" required>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Например: Договор подряда №12"
                  />
                </Form.Item>
                <Form.Item label="Тип документа">
                  <Select<DocumentKind>
                    value={kind}
                    onChange={(v) => setKind(v)}
                    options={DOCUMENT_KIND_ORDER.map((k) => ({
                      value: k,
                      label: DOCUMENT_KIND_LABEL[k],
                    }))}
                  />
                </Form.Item>
                <Form.Item label="Объект">
                  <ProjectSelect
                    value={projectId}
                    onChange={(v) => setProjectId(v)}
                    placeholder="Не выбран"
                  />
                </Form.Item>
              </Form>

              {mode === 'TEMPLATE' && templateLoading && templateId && (
                <Skeleton active paragraph={{ rows: 4 }} />
              )}

              {mode === 'TEMPLATE' && template && (template.variables?.length ?? 0) > 0 && (
                <VariablesForm
                  variables={template.variables ?? []}
                  values={variableValues}
                  onChange={setVariableValues}
                />
              )}

              {mode === 'BLANK' && (
                <Form layout="vertical" component="div">
                  <Form.Item
                    label="Содержимое"
                    help="Word-подобный редактор: жирный, заголовки, списки, таблицы."
                  >
                    <RichDocEditor value={blankContent} onChange={setBlankContent} />
                  </Form.Item>
                </Form>
              )}

              {mode === 'TEMPLATE' && !templateId && (
                <Alert
                  type="info"
                  showIcon
                  message="Выберите шаблон, чтобы увидеть поля и предпросмотр."
                />
              )}
            </Space>
          </Card>

          <div className="doc-builder__preview">
            <div className="doc-page" aria-label="Предпросмотр документа A4">
              {!previewContent.trim() ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Пусто — выберите шаблон или начните писать в режиме «Пустой»"
                />
              ) : (
                <MarkdownPreview content={previewContent} values={previewValues} />
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}

function VariablesForm({
  variables,
  values,
  onChange,
}: {
  variables: TemplateVariable[];
  values: Record<string, string | number>;
  onChange: (next: Record<string, string | number>) => void;
}) {
  const setField = (k: string, v: string | number | undefined) => {
    const next = { ...values };
    if (v === undefined || v === '') {
      delete next[k];
    } else {
      next[k] = v;
    }
    onChange(next);
  };

  return (
    <Card size="small" title={<Space size={8}><Tag color="blue">Поля</Tag>Подстановки шаблона</Space>}>
      <Form layout="vertical" component="div">
        {variables.map((v) => {
          const key = v.name;
          const value = values[key];
          if (v.type === 'date') {
            return (
              <Form.Item key={key} label={v.label} help={v.hint}>
                <DatePicker
                  style={{ width: '100%' }}
                  value={typeof value === 'string' && value ? dayjs(value) : null}
                  onChange={(d) =>
                    setField(key, d ? d.format('DD.MM.YYYY') : undefined)
                  }
                  format="DD.MM.YYYY"
                  allowClear
                />
              </Form.Item>
            );
          }
          if (v.type === 'money' || v.type === 'number') {
            return (
              <Form.Item key={key} label={v.label} help={v.hint}>
                <InputNumber
                  style={{ width: '100%' }}
                  value={typeof value === 'number' ? value : undefined}
                  onChange={(n) =>
                    setField(key, typeof n === 'number' ? n : undefined)
                  }
                  min={0}
                />
              </Form.Item>
            );
          }
          return (
            <Form.Item key={key} label={v.label} help={v.hint}>
              <Input
                value={typeof value === 'string' ? value : ''}
                onChange={(e) => setField(key, e.target.value || undefined)}
              />
            </Form.Item>
          );
        })}
      </Form>
    </Card>
  );
}

export default function NewDocumentPage() {
  return (
    <Suspense fallback={<Skeleton active style={{ padding: 24 }} />}>
      <NewDocumentPageInner />
    </Suspense>
  );
}
