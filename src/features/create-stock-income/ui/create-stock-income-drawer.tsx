'use client';

import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Tag,
  Tooltip,
} from 'antd';
import {
  CopyOutlined,
  DeleteOutlined,
  ImportOutlined,
  PaperClipOutlined,
  PlusOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { message } from '@shared/lib/antd-static';
import { FormModal } from '@shared/ui/form-modal';
import { useFormDirty } from '@shared/hooks/use-form-dirty';
import { WarehouseSelect } from '@shared/ui/warehouse-select';
import { SupplierSelect } from '@shared/ui/supplier-select';
import { ProjectSelect } from '@shared/ui/project-select';
import { MaterialSelect } from '@shared/ui/material-select';
import { useCreateMovementsBatch } from '@entities/inventory-item/hooks';
import { useInventoryItems } from '@entities/inventory-item/hooks';
import { useProject } from '@entities/project/hooks';
import { formatMoney, formatNumber } from '@shared/lib/format';
import './receipt-form.css';

interface Line {
  /** Stable local id — react key + focus targets. */
  uid: string;
  itemId?: string;
  /** Snapshot from the picked material; editable per line if needed. */
  unit?: string;
  qty?: number;
  unitCost?: number;
  comment?: string;
}

interface HeaderShape {
  warehouseId?: string;
  supplierId?: string;
  projectId?: string;
  docNumber?: string;
  date: Dayjs;
  comment?: string;
}

interface Props {
  /** When provided replaces the default `«Приход»` button. */
  trigger?: React.ReactNode;
  /** Defaults — useful when the modal is launched from a project page. */
  projectId?: string;
  warehouseId?: string;
}

let uidCounter = 0;
const newUid = () => `r-${Date.now()}-${++uidCounter}`;

const RECENT_KEY = 'tomstroy.receipt.recent';

function readRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function pushRecent(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    const cur = readRecent();
    const next = [...ids, ...cur.filter((x) => !ids.includes(x))].slice(0, 8);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

/**
 * Enterprise warehouse receipt form (приход материалов). Mirrors the
 * UX of 1C / MoySklad / Odoo / ERPNext: top metadata block + dense
 * line table + sticky totals footer.
 *
 * Backend stays a flat batch of inventory movements. Per-line we encode
 * supplier / docNumber / header-comment into `note` so analytics and
 * audit logs retain context without a schema migration.
 */
export function CreateStockIncomeDrawer({
  trigger,
  projectId: defaultProject,
  warehouseId: defaultWarehouse,
}: Props = {}) {
  const [open, setOpen] = useState(false);
  const [headerForm] = Form.useForm<HeaderShape>();
  const dirty = useFormDirty(headerForm);
  const mutation = useCreateMovementsBatch();

  // Context-aware: when the drawer is opened from inside an object route
  // (e.g. /objects/:id/warehouse) the caller passes a fixed `projectId`.
  // In that case we hide the editable selector and show a readonly chip,
  // injecting the locked id into the payload directly. Avoids dual-source-
  // of-truth bugs where the user accidentally re-picks a different object.
  const lockedProject = Boolean(defaultProject);
  const { data: lockedProjectData } = useProject(defaultProject ?? '');

  // Lines kept in local state (faster reactivity than antd Form.List for
  // 20-50 row receipts). Header stays in Form for free validation.
  const [lines, setLines] = useState<Line[]>([{ uid: newUid() }]);

  // Recent / frequently-used materials (last 8 used by this user)
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const { data: recentItemsData } = useInventoryItems({ limit: 50 });
  const recentItems = useMemo(() => {
    const all = recentItemsData?.data ?? [];
    return recentIds
      .map((id) => all.find((x) => x.id === id))
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
  }, [recentItemsData, recentIds]);

  useEffect(() => {
    if (open) setRecentIds(readRecent());
  }, [open]);

  // Auto-focus first line on open
  const firstLineRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      firstLineRef.current?.querySelector<HTMLElement>('input, .ant-select-selection-search-input')?.focus();
    }, 80);
    return () => clearTimeout(t);
  }, [open]);

  const totals = useMemo(() => {
    let qty = 0;
    let amount = 0;
    let positions = 0;
    for (const l of lines) {
      if (!l.itemId) continue;
      positions += 1;
      qty += Number(l.qty ?? 0);
      amount += Number(l.qty ?? 0) * Number(l.unitCost ?? 0);
    }
    return { qty, amount, positions };
  }, [lines]);

  const close = () => {
    setOpen(false);
    setLines([{ uid: newUid() }]);
    headerForm.resetFields();
  };

  const setLine = (uid: string, patch: Partial<Line>) =>
    setLines((cur) => cur.map((l) => (l.uid === uid ? { ...l, ...patch } : l)));

  const addLine = () => {
    const next = { uid: newUid() };
    setLines((cur) => [...cur, next]);
    // Focus the new row's material picker after render
    setTimeout(() => {
      document
        .querySelector<HTMLElement>(`[data-line-uid="${next.uid}"] .ant-select-selection-search-input`)
        ?.focus();
    }, 30);
  };

  const removeLine = (uid: string) =>
    setLines((cur) => (cur.length === 1 ? cur : cur.filter((l) => l.uid !== uid)));

  const duplicateLine = (uid: string) => {
    setLines((cur) => {
      const idx = cur.findIndex((l) => l.uid === uid);
      if (idx < 0) return cur;
      const copy = { ...cur[idx], uid: newUid() };
      return [...cur.slice(0, idx + 1), copy, ...cur.slice(idx + 1)];
    });
  };

  const pickMaterial = (uid: string, item: { id: string; unit: string; costPrice: number }) => {
    const current = lines.find((l) => l.uid === uid)?.unitCost;
    const fallback = Number(item.costPrice) || undefined;
    setLine(uid, {
      itemId: item.id,
      unit: item.unit,
      // Pre-fill unitCost with last known cost if user hasn't typed one yet.
      unitCost: current ?? fallback,
    });
  };

  const handleSubmit = async () => {
    const header = await headerForm.validateFields().catch(() => null);
    if (!header) return;

    const valid = lines.filter(
      (l) => l.itemId && Number(l.qty ?? 0) > 0 && Number(l.unitCost ?? 0) >= 0,
    );
    if (valid.length === 0) {
      message.warning('Добавьте хотя бы одну позицию с материалом, кол-вом и ценой');
      return;
    }

    // Compose a human-readable note that carries the header context.
    const headerBits: string[] = [];
    if (header.docNumber) headerBits.push(`Накладная № ${header.docNumber}`);
    headerBits.push(`от ${header.date.format('DD.MM.YYYY')}`);
    if (header.comment) headerBits.push(header.comment);
    const headerNote = headerBits.join(' · ');

    const movements = valid.map((l) => ({
      itemId: l.itemId!,
      warehouseId: header.warehouseId!,
      movementType: 'INCOME' as const,
      qty: Number(l.qty),
      unitCost: Number(l.unitCost ?? 0),
      projectId: header.projectId,
      note: [headerNote, l.comment?.trim() || null].filter(Boolean).join(' — '),
    }));

    try {
      await mutation.mutateAsync(movements);
      pushRecent(valid.map((l) => l.itemId!));
      message.success(
        `Оприходовано: ${valid.length} поз. · ${formatMoney(totals.amount)}`,
      );
      close();
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Не удалось оприходовать';
      message.error(typeof detail === 'string' ? detail : 'Не удалось оприходовать');
    }
  };

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <Button icon={<ImportOutlined />} onClick={() => setOpen(true)}>
          Приход
        </Button>
      )}
      <FormModal
        title="Приход материалов"
        subtitle="Приёмка на склад. Для заказа с PO используйте «Закупки → Принять»."
        open={open}
        onClose={close}
        width={1100}
        dirty={dirty || lines.some((l) => l.itemId)}
        onSubmit={handleSubmit}
        footer={
          <div className="rcpt-footer">
            <div className="rcpt-footer__totals">
              <div className="rcpt-footer__cell">
                <span className="rcpt-footer__label">Позиций</span>
                <strong>{totals.positions}</strong>
              </div>
              <div className="rcpt-footer__cell">
                <span className="rcpt-footer__label">Общее кол-во</span>
                <strong>{formatNumber(totals.qty)}</strong>
              </div>
              <div className="rcpt-footer__cell rcpt-footer__cell--total">
                <span className="rcpt-footer__label">Итого</span>
                <strong style={{ color: 'var(--finance-income, #389e0d)' }}>
                  {formatMoney(totals.amount)}
                </strong>
              </div>
            </div>
            <Space>
              <Button onClick={close}>Отмена</Button>
              <Button
                type="primary"
                size="large"
                loading={mutation.isPending}
                onClick={handleSubmit}
              >
                Оприходовать
              </Button>
            </Space>
          </div>
        }
      >
        <div className="rcpt-body">
          {/* ── Top metadata block ─────────────────────────── */}
          <Form<HeaderShape>
            form={headerForm}
            layout="vertical"
            requiredMark={false}
            initialValues={{
              date: dayjs(),
              warehouseId: defaultWarehouse,
              projectId: defaultProject,
            }}
            className="rcpt-header"
          >
            <Row gutter={12}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="warehouseId"
                  label="Склад"
                  rules={[{ required: true, message: 'Выберите склад' }]}
                >
                  <WarehouseSelect />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="supplierId" label="Поставщик">
                  <SupplierSelect placeholder="Не выбран" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                {lockedProject ? (
                  <Form.Item label="Для объекта">
                    <div className="rcpt-context-chip">
                      <Tag color="blue" className="rcpt-context-chip__tag">
                        {lockedProjectData?.name ?? 'Текущий объект'}
                      </Tag>
                      <span className="rcpt-context-chip__hint">
                        Привязка к объекту установлена автоматически
                      </span>
                    </div>
                  </Form.Item>
                ) : (
                  <Form.Item name="projectId" label="Объект (опц.)">
                    <ProjectSelect placeholder="Не выбран" />
                  </Form.Item>
                )}
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  name="date"
                  label="Дата"
                  rules={[{ required: true }]}
                >
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="docNumber" label="№ накладной">
                  <Input placeholder="напр. 12-2026" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="comment" label="Комментарий">
                  <Input placeholder="Например: приём цемента от ОсОО «Альфа»" />
                </Form.Item>
              </Col>
            </Row>
          </Form>

          {/* ── Recent / frequently used materials chips ───── */}
          {recentItems.length > 0 && (
            <div className="rcpt-recent">
              <ThunderboltOutlined className="rcpt-recent__icon" />
              <span className="rcpt-recent__label">Часто используемые:</span>
              <div className="rcpt-recent__chips">
                {recentItems.slice(0, 8).map((it) => (
                  <Tag
                    key={it.id}
                    color="blue"
                    className="rcpt-recent__chip"
                    onClick={() => {
                      // Find empty line, or add new one
                      const emptyLine = lines.find((l) => !l.itemId);
                      const target = emptyLine ?? { uid: newUid() };
                      const patch: Partial<Line> = {
                        itemId: it.id,
                        unit: it.unit,
                        unitCost: Number(it.costPrice) || undefined,
                      };
                      if (emptyLine) {
                        setLine(target.uid, patch);
                      } else {
                        setLines((cur) => [...cur, { ...target, ...patch }]);
                      }
                    }}
                  >
                    {it.name}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          {/* ── Lines table ─────────────────────────────────── */}
          <div className="rcpt-table" role="grid">
            <div className="rcpt-table__head">
              <div className="rcpt-col rcpt-col--num">#</div>
              <div className="rcpt-col rcpt-col--material">Материал</div>
              <div className="rcpt-col rcpt-col--unit">Ед.</div>
              <div className="rcpt-col rcpt-col--qty">Кол-во</div>
              <div className="rcpt-col rcpt-col--price">Цена</div>
              <div className="rcpt-col rcpt-col--sum">Сумма</div>
              <div className="rcpt-col rcpt-col--comment">Комментарий</div>
              <div className="rcpt-col rcpt-col--actions" />
            </div>
            {lines.map((line, idx) => {
              const sum = Number(line.qty ?? 0) * Number(line.unitCost ?? 0);
              return (
                <div
                  key={line.uid}
                  data-line-uid={line.uid}
                  ref={idx === 0 ? firstLineRef : null}
                  className="rcpt-table__row"
                  role="row"
                >
                  <div className="rcpt-col rcpt-col--num">{idx + 1}</div>
                  <div className="rcpt-col rcpt-col--material">
                    <MaterialSelect
                      value={line.itemId}
                      onChange={(id, meta) => {
                        if (!id) {
                          setLine(line.uid, {
                            itemId: undefined,
                            unit: undefined,
                          });
                          return;
                        }
                        pickMaterial(line.uid, {
                          id,
                          unit: meta?.unit ?? '',
                          costPrice: Number(meta?.costPrice ?? 0),
                        });
                      }}
                      placeholder="Выберите материал"
                      size="small"
                    />
                  </div>
                  <div className="rcpt-col rcpt-col--unit">
                    <Input
                      size="small"
                      value={line.unit ?? ''}
                      onChange={(e) => setLine(line.uid, { unit: e.target.value })}
                      placeholder="—"
                      title="Единица измерения подставляется из материала, но её можно перебить"
                    />
                  </div>
                  <div className="rcpt-col rcpt-col--qty">
                    <InputNumber
                      size="small"
                      min={0}
                      step={1}
                      value={line.qty}
                      onChange={(v) =>
                        setLine(line.uid, {
                          qty: typeof v === 'number' ? v : undefined,
                        })
                      }
                      style={{ width: '100%' }}
                      placeholder="0"
                    />
                  </div>
                  <div className="rcpt-col rcpt-col--price">
                    <InputNumber
                      size="small"
                      min={0}
                      step={1}
                      value={line.unitCost}
                      onChange={(v) =>
                        setLine(line.uid, {
                          unitCost: typeof v === 'number' ? v : undefined,
                        })
                      }
                      style={{ width: '100%' }}
                      placeholder="0"
                      formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                      parser={(v) => Number(`${v}`.replace(/\s/g, '')) as 0}
                    />
                  </div>
                  <div className="rcpt-col rcpt-col--sum">
                    <strong>{sum > 0 ? formatMoney(sum) : '—'}</strong>
                  </div>
                  <div className="rcpt-col rcpt-col--comment">
                    <Input
                      size="small"
                      value={line.comment ?? ''}
                      onChange={(e) => setLine(line.uid, { comment: e.target.value })}
                      placeholder="—"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (idx === lines.length - 1) addLine();
                          else
                            document
                              .querySelector<HTMLElement>(
                                `[data-line-uid="${lines[idx + 1].uid}"] .ant-select-selection-search-input`,
                              )
                              ?.focus();
                        }
                      }}
                    />
                  </div>
                  <div className="rcpt-col rcpt-col--actions">
                    <Tooltip title="Дублировать строку">
                      <Button
                        type="text"
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => duplicateLine(line.uid)}
                      />
                    </Tooltip>
                    <Tooltip title="Удалить строку">
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeLine(line.uid)}
                        disabled={lines.length === 1}
                      />
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rcpt-actions">
            <Button onClick={addLine} icon={<PlusOutlined />} type="dashed">
              Добавить строку (Enter)
            </Button>
            <Tooltip title="Загрузка фото чека/документа — в следующей версии">
              <Button icon={<PaperClipOutlined />} disabled>
                Прикрепить документ
              </Button>
            </Tooltip>
          </div>
        </div>
      </FormModal>
    </>
  );
}
