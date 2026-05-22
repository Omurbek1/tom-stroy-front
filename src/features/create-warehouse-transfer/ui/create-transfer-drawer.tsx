'use client';

import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Segmented,
  Space,
  Tag,
  Tooltip,
} from 'antd';
import {
  CopyOutlined,
  DeleteOutlined,
  PlusOutlined,
  SwapOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { message } from '@shared/lib/antd-static';
import { FormModal } from '@shared/ui/form-modal';
import { useFormDirty } from '@shared/hooks/use-form-dirty';
import { WarehouseSelect } from '@shared/ui/warehouse-select';
import { BrigadeSelect } from '@shared/ui/brigade-select';
import { MaterialSelect } from '@shared/ui/material-select';
import {
  useCreateTransfer,
} from '@entities/warehouse-transfer/hooks';
import { useInventoryBalances } from '@entities/inventory-item/hooks';
import { ensureBrigadeWarehouse } from '@entities/brigade/api';
import type { CreateTransferPayload } from '@entities/warehouse-transfer/types';
import { formatMoney, formatNumber } from '@shared/lib/format';
import './transfer-form.css';

type DestKind = 'warehouse' | 'brigade';

interface Line {
  uid: string;
  itemId?: string;
  unit?: string;
  qty?: number;
  /** WAC at source, for live cost preview. Backend snapshots at SHIP. */
  unitCost?: number;
  available?: number;
  comment?: string;
}

interface HeaderShape {
  fromWarehouseId?: string;
  destKind: DestKind;
  toWarehouseId?: string;
  toBrigadeId?: string;
  docNumber?: string;
  date: Dayjs;
  note?: string;
}

let uidCounter = 0;
const newUid = () => `t-${Date.now()}-${++uidCounter}`;

const RECENT_KEY = 'tomstroy.transfer.recent';
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

interface Props {
  /** Defaults — e.g. from a per-warehouse page action. */
  fromWarehouseId?: string;
}

/**
 * Enterprise inter-warehouse transfer form (перемещение). Mirrors the
 * Receipt / Writeoff UX — top metadata + dense lines table + sticky
 * totals footer.
 *
 * Two destinations:
 *  • Склад → склад (regular transfer)
 *  • Склад → бригада (auto-resolves brigade's personal warehouse via
 *    `ensureBrigadeWarehouse`)
 *
 * For "на объект" use Writeoff with projectId — transferring TO a
 * project doesn't reduce inventory cost, it's the writeoff that does.
 *
 * Stock flow modelled by the backend:
 *   PENDING (just created)
 *     → SHIPPED  (TRANSFER_OUT at source, unitCost snapshot)
 *     → RECEIVED (TRANSFER_IN at destination, same unitCost)
 *
 * This form only creates the PENDING transfer header + lines. The
 * shipping & receiving flow lives on the transfers list page so two
 * different people can hand off the materials.
 */
export function CreateTransferDrawer({ fromWarehouseId: defaultFrom }: Props = {}) {
  const [open, setOpen] = useState(false);
  const [headerForm] = Form.useForm<HeaderShape>();
  const dirty = useFormDirty(headerForm);
  const mutation = useCreateTransfer();
  const [resolving, setResolving] = useState(false);

  const [lines, setLines] = useState<Line[]>([{ uid: newUid() }]);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  const fromId = Form.useWatch('fromWarehouseId', headerForm);
  const toWarehouseId = Form.useWatch('toWarehouseId', headerForm);
  const destKind = (Form.useWatch('destKind', headerForm) ?? 'warehouse') as DestKind;

  // Load source-warehouse balances for the per-line available preview.
  const { data: balanceData } = useInventoryBalances({
    warehouseId: fromId,
    limit: 500,
  });
  const balanceByItem = useMemo(() => {
    const map = new Map<string, { qty: number; avgCost: number; unit: string }>();
    for (const b of balanceData?.data ?? []) {
      map.set(b.id, {
        qty: Number(b.available ?? b.qty),
        avgCost: Number(b.avgCost),
        unit: b.unit,
      });
    }
    return map;
  }, [balanceData]);

  useEffect(() => {
    setLines((cur) =>
      cur.map((l) =>
        l.itemId
          ? {
              ...l,
              available: balanceByItem.get(l.itemId)?.qty ?? 0,
              unitCost: balanceByItem.get(l.itemId)?.avgCost ?? l.unitCost,
              unit: balanceByItem.get(l.itemId)?.unit ?? l.unit,
            }
          : l,
      ),
    );
  }, [balanceByItem]);

  useEffect(() => {
    if (open) setRecentIds(readRecent());
  }, [open]);

  const firstLineRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      firstLineRef.current
        ?.querySelector<HTMLElement>('input, .ant-select-selection-search-input')
        ?.focus();
    }, 80);
    return () => clearTimeout(t);
  }, [open]);

  const totals = useMemo(() => {
    let qty = 0;
    let amount = 0;
    let positions = 0;
    let overdraft = false;
    for (const l of lines) {
      if (!l.itemId) continue;
      positions += 1;
      const q = Number(l.qty ?? 0);
      qty += q;
      amount += q * Number(l.unitCost ?? 0);
      if (l.available !== undefined && q > l.available) overdraft = true;
    }
    return { qty, amount, positions, overdraft };
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
    setTimeout(() => {
      document
        .querySelector<HTMLElement>(
          `[data-line-uid="${next.uid}"] .ant-select-selection-search-input`,
        )
        ?.focus();
    }, 30);
  };

  const removeLine = (uid: string) =>
    setLines((cur) => (cur.length === 1 ? cur : cur.filter((l) => l.uid !== uid)));

  const duplicateLine = (uid: string) =>
    setLines((cur) => {
      const idx = cur.findIndex((l) => l.uid === uid);
      if (idx < 0) return cur;
      const copy = { ...cur[idx], uid: newUid() };
      return [...cur.slice(0, idx + 1), copy, ...cur.slice(idx + 1)];
    });

  const pickMaterial = (uid: string, itemId?: string, meta?: { unit: string }) => {
    if (!itemId) {
      setLine(uid, {
        itemId: undefined,
        unit: undefined,
        unitCost: undefined,
        available: undefined,
      });
      return;
    }
    const bal = balanceByItem.get(itemId);
    setLine(uid, {
      itemId,
      unit: meta?.unit ?? bal?.unit ?? '',
      unitCost: bal?.avgCost ?? undefined,
      available: bal?.qty ?? 0,
    });
  };

  const recentItems = useMemo(() => {
    const all = balanceData?.data ?? [];
    return recentIds
      .map((id) => all.find((x) => x.id === id))
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
  }, [balanceData, recentIds]);

  const handleSubmit = async () => {
    const header = await headerForm.validateFields().catch(() => null);
    if (!header) return;

    if (header.destKind === 'warehouse' && header.toWarehouseId === header.fromWarehouseId) {
      message.error('Источник и приёмник не могут совпадать');
      return;
    }

    const valid = lines.filter((l) => l.itemId && Number(l.qty ?? 0) > 0);
    if (valid.length === 0) {
      message.warning('Добавьте хотя бы одну позицию');
      return;
    }
    if (totals.overdraft) {
      message.error('Нельзя переместить больше, чем есть на складе-источнике');
      return;
    }

    // Resolve destination warehouse.
    let toWarehouseId = header.toWarehouseId;
    if (header.destKind === 'brigade') {
      if (!header.toBrigadeId) {
        message.error('Выберите бригаду');
        return;
      }
      setResolving(true);
      try {
        toWarehouseId = await ensureBrigadeWarehouse(header.toBrigadeId);
      } catch {
        message.error('Не удалось определить склад бригады');
        return;
      } finally {
        setResolving(false);
      }
    }
    if (!toWarehouseId) {
      message.error('Выберите приёмник');
      return;
    }

    // Encode header context into note (docNumber + date + free comment).
    const headerBits: string[] = [];
    if (header.docNumber) headerBits.push(`Накладная № ${header.docNumber}`);
    headerBits.push(`от ${header.date.format('DD.MM.YYYY')}`);
    if (header.note) headerBits.push(header.note);

    const payload: CreateTransferPayload = {
      fromWarehouseId: header.fromWarehouseId!,
      toWarehouseId,
      note: headerBits.join(' · '),
      lines: valid.map((l) => ({
        itemId: l.itemId!,
        qty: Number(l.qty),
      })),
    };

    try {
      await mutation.mutateAsync(payload);
      pushRecent(valid.map((l) => l.itemId!));
      message.success(
        `Перемещение создано: ${valid.length} поз. · ≈ ${formatMoney(totals.amount)}`,
      );
      close();
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string; message?: string } } })?.response
          ?.data?.detail ??
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Не удалось создать перемещение';
      message.error(typeof detail === 'string' ? detail : 'Не удалось создать перемещение');
    }
  };

  return (
    <>
      <Button icon={<SwapOutlined />} onClick={() => setOpen(true)}>
        Перемещение
      </Button>
      <FormModal
        title="Перемещение материалов"
        subtitle="Создаём PENDING-перемещение. Отгрузка и приёмка — раздельные шаги в реестре перемещений."
        open={open}
        onClose={close}
        width={1100}
        dirty={dirty || lines.some((l) => l.itemId)}
        onSubmit={handleSubmit}
        footer={
          <div className="trf-footer">
            <div className="trf-footer__totals">
              <div className="trf-footer__cell">
                <span className="trf-footer__label">Позиций</span>
                <strong>{totals.positions}</strong>
              </div>
              <div className="trf-footer__cell">
                <span className="trf-footer__label">Общее кол-во</span>
                <strong>{formatNumber(totals.qty)}</strong>
              </div>
              <div className="trf-footer__cell trf-footer__cell--total">
                <span className="trf-footer__label">Стоимость (≈ WAC)</span>
                <strong>{formatMoney(totals.amount)}</strong>
              </div>
              {totals.overdraft && (
                <Tag color="red" icon={<WarningOutlined />}>
                  Превышен остаток источника
                </Tag>
              )}
            </div>
            <Space>
              <Button onClick={close}>Отмена</Button>
              <Button
                type="primary"
                size="large"
                loading={mutation.isPending || resolving}
                onClick={handleSubmit}
                disabled={totals.overdraft}
              >
                Создать перемещение
              </Button>
            </Space>
          </div>
        }
      >
        <div className="trf-body">
          {/* ── Header block ─────────────────────────────────── */}
          <Form<HeaderShape>
            form={headerForm}
            layout="vertical"
            requiredMark={false}
            initialValues={{
              date: dayjs(),
              destKind: 'warehouse',
              fromWarehouseId: defaultFrom,
            }}
            className="trf-header"
          >
            <Row gutter={12}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="fromWarehouseId"
                  label="Откуда (склад)"
                  rules={[{ required: true, message: 'Выберите источник' }]}
                >
                  <WarehouseSelect
                    placeholder="Источник"
                    excludeId={toWarehouseId}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="destKind" label="Куда">
                  <Segmented
                    block
                    options={[
                      { label: 'На склад', value: 'warehouse' },
                      { label: 'Бригаде', value: 'brigade' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                {destKind === 'warehouse' ? (
                  <Form.Item
                    name="toWarehouseId"
                    label="Склад приёмки"
                    rules={[{ required: true, message: 'Выберите склад' }]}
                  >
                    <WarehouseSelect placeholder="Приёмник" excludeId={fromId} />
                  </Form.Item>
                ) : (
                  <Form.Item
                    name="toBrigadeId"
                    label="Бригада"
                    rules={[{ required: true, message: 'Выберите бригаду' }]}
                    extra="Материалы попадут на личный склад бригады"
                  >
                    <BrigadeSelect placeholder="Бригада" />
                  </Form.Item>
                )}
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="date" label="Дата" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="docNumber" label="№ накладной">
                  <Input placeholder="напр. ПЕР-12" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="note" label="Комментарий">
                  <Input placeholder="Например: перекидываем цемент на ЖК Север" />
                </Form.Item>
              </Col>
            </Row>
          </Form>

          {/* ── Recent / часто перемещаемые ────────────────── */}
          {recentItems.length > 0 && (
            <div className="trf-recent">
              <ThunderboltOutlined className="trf-recent__icon" />
              <span className="trf-recent__label">Часто перемещаемые:</span>
              <div className="trf-recent__chips">
                {recentItems.slice(0, 8).map((it) => (
                  <Tag
                    key={it.id}
                    color="cyan"
                    className="trf-recent__chip"
                    onClick={() => {
                      const emptyLine = lines.find((l) => !l.itemId);
                      if (emptyLine) {
                        pickMaterial(emptyLine.uid, it.id, { unit: it.unit });
                      } else {
                        const next = { uid: newUid() };
                        setLines((cur) => [...cur, next]);
                        setTimeout(() => pickMaterial(next.uid, it.id, { unit: it.unit }), 0);
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
          <div className="trf-table" role="grid">
            <div className="trf-table__head">
              <div className="trf-col trf-col--num">#</div>
              <div className="trf-col trf-col--material">Материал</div>
              <div className="trf-col trf-col--unit">Ед.</div>
              <div className="trf-col trf-col--avail">Остаток источника</div>
              <div className="trf-col trf-col--qty">Переместить</div>
              <div className="trf-col trf-col--price">Цена (WAC)</div>
              <div className="trf-col trf-col--sum">Стоимость</div>
              <div className="trf-col trf-col--comment">Комментарий</div>
              <div className="trf-col trf-col--actions" />
            </div>
            {lines.map((line, idx) => {
              const qty = Number(line.qty ?? 0);
              const sum = qty * Number(line.unitCost ?? 0);
              const over = line.available !== undefined && qty > line.available;
              return (
                <div
                  key={line.uid}
                  data-line-uid={line.uid}
                  ref={idx === 0 ? firstLineRef : null}
                  className={`trf-table__row${over ? ' trf-table__row--over' : ''}`}
                  role="row"
                >
                  <div className="trf-col trf-col--num">{idx + 1}</div>
                  <div className="trf-col trf-col--material">
                    <MaterialSelect
                      value={line.itemId}
                      warehouseId={fromId}
                      onChange={(id, meta) =>
                        pickMaterial(line.uid, id, meta ? { unit: meta.unit } : undefined)
                      }
                      placeholder={fromId ? 'Выберите материал' : 'Сначала выберите склад'}
                      size="small"
                    />
                  </div>
                  <div className="trf-col trf-col--unit">
                    <span>{line.unit ?? '—'}</span>
                  </div>
                  <div className="trf-col trf-col--avail">
                    {line.itemId ? (
                      <Tag
                        color={
                          line.available === undefined
                            ? 'default'
                            : line.available > 0
                              ? 'green'
                              : 'red'
                        }
                        style={{ margin: 0 }}
                      >
                        {line.available !== undefined
                          ? formatNumber(line.available)
                          : '—'}
                      </Tag>
                    ) : (
                      <span style={{ color: '#bfbfbf' }}>—</span>
                    )}
                  </div>
                  <div className="trf-col trf-col--qty">
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
                      status={over ? 'error' : undefined}
                    />
                  </div>
                  <div className="trf-col trf-col--price">
                    <span style={{ color: 'var(--ant-color-text-secondary, #8c8c8c)' }}>
                      {line.unitCost ? formatMoney(line.unitCost) : '—'}
                    </span>
                  </div>
                  <div className="trf-col trf-col--sum">
                    <strong style={{ color: over ? '#cf1322' : undefined }}>
                      {sum > 0 ? formatMoney(sum) : '—'}
                    </strong>
                  </div>
                  <div className="trf-col trf-col--comment">
                    <Input
                      size="small"
                      value={line.comment ?? ''}
                      onChange={(e) =>
                        setLine(line.uid, { comment: e.target.value })
                      }
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
                  <div className="trf-col trf-col--actions">
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

          <div className="trf-actions">
            <Button onClick={addLine} icon={<PlusOutlined />} type="dashed">
              Добавить строку (Enter)
            </Button>
          </div>
        </div>
      </FormModal>
    </>
  );
}
