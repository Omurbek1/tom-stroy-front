'use client';

import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Tag,
  Tooltip,
} from 'antd';
import {
  CopyOutlined,
  DeleteOutlined,
  ExportOutlined,
  PlusOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { message } from '@shared/lib/antd-static';
import { FormModal } from '@shared/ui/form-modal';
import { useFormDirty } from '@shared/hooks/use-form-dirty';
import { WarehouseSelect } from '@shared/ui/warehouse-select';
import { ProjectSelect } from '@shared/ui/project-select';
import { BrigadeSelect } from '@shared/ui/brigade-select';
import { EmployeeSelect } from '@shared/ui/employee-select';
import { MaterialSelect } from '@shared/ui/material-select';
import {
  useCreateMovementsBatch,
  useInventoryBalances,
} from '@entities/inventory-item/hooks';
import { useBrigades } from '@entities/brigade/hooks';
import { useEmployees } from '@entities/employee/hooks';
import { useProjectsList } from '@entities/project/hooks';
import { formatMoney, formatNumber } from '@shared/lib/format';
import './writeoff-form.css';

interface Line {
  uid: string;
  itemId?: string;
  unit?: string;
  qty?: number;
  /** Snapshot of avgCost (WAC) at the moment material was picked. */
  unitCost?: number;
  /** Available qty in the chosen warehouse for this item. */
  available?: number;
  comment?: string;
}

interface HeaderShape {
  warehouseId?: string;
  projectId?: string;
  brigadeId?: string;
  employeeId?: string;
  reason?: WriteoffReason;
  date: Dayjs;
  comment?: string;
}

type WriteoffReason =
  | 'CONSUMED'
  | 'DAMAGED'
  | 'LOST'
  | 'RETURNED_BAD'
  | 'OTHER';

const REASON_OPTIONS: { value: WriteoffReason; label: string }[] = [
  { value: 'CONSUMED', label: 'Использовано на объекте' },
  { value: 'DAMAGED', label: 'Брак / повреждение' },
  { value: 'LOST', label: 'Утеряно' },
  { value: 'RETURNED_BAD', label: 'Возврат поставщику' },
  { value: 'OTHER', label: 'Прочее' },
];

const REASON_LABEL: Record<WriteoffReason, string> = Object.fromEntries(
  REASON_OPTIONS.map((o) => [o.value, o.label]),
) as Record<WriteoffReason, string>;

let uidCounter = 0;
const newUid = () => `w-${Date.now()}-${++uidCounter}`;

const RECENT_KEY = 'tomstroy.writeoff.recent';
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
  trigger?: React.ReactNode;
  /** Defaults when launched from the object workspace. */
  projectId?: string;
  warehouseId?: string;
}

/**
 * Enterprise writeoff form (списание материалов). Mirrors the receipt
 * UX (1C / Odoo / MoySklad) — top metadata block + dense lines table +
 * sticky totals footer, plus writeoff-specific bits:
 *
 *  • реason (consumed / damaged / lost / returned / other)
 *  • brigade + responsible employee (encoded into the note since the
 *    legacy `inventory_transaction` table has no brigade/responsible
 *    columns — analytics still groups by projectId + note search)
 *  • per-line available-stock preview with red warning at overshoot
 *  • blocks submit if any line tries to write off more than available
 */
export function CreateStockWriteoffDrawer({
  trigger,
  projectId: defaultProject,
  warehouseId: defaultWarehouse,
}: Props = {}) {
  const [open, setOpen] = useState(false);
  const [headerForm] = Form.useForm<HeaderShape>();
  const dirty = useFormDirty(headerForm);
  const mutation = useCreateMovementsBatch();

  const [lines, setLines] = useState<Line[]>([{ uid: newUid() }]);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  const warehouseId = Form.useWatch('warehouseId', headerForm);

  // Load balances for the selected warehouse so we can preview available qty.
  const { data: balanceData } = useInventoryBalances({
    warehouseId,
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

  // Friendly labels for note encoding
  const { data: brigades } = useBrigades();
  const { data: employees } = useEmployees();
  const { data: projects } = useProjectsList({});

  // Re-apply known availability whenever balances refresh
  useEffect(() => {
    setLines((cur) =>
      cur.map((l) =>
        l.itemId
          ? {
              ...l,
              available: balanceByItem.get(l.itemId)?.qty ?? 0,
              unit: balanceByItem.get(l.itemId)?.unit ?? l.unit,
            }
          : l,
      ),
    );
  }, [balanceByItem]);

  // Items used recently in writeoffs — quick chips
  useEffect(() => {
    if (open) setRecentIds(readRecent());
  }, [open]);

  const firstLineRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      firstLineRef.current
        ?.querySelector<HTMLElement>(
          'input, .ant-select-selection-search-input',
        )
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
      setLine(uid, { itemId: undefined, unit: undefined, unitCost: undefined, available: undefined });
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

    const valid = lines.filter(
      (l) => l.itemId && Number(l.qty ?? 0) > 0,
    );
    if (valid.length === 0) {
      message.warning('Добавьте хотя бы одну позицию для списания');
      return;
    }

    if (totals.overdraft) {
      message.error(
        'Нельзя списать больше, чем есть на складе. Уменьшите количество или сделайте перемещение/закупку.',
      );
      return;
    }

    if (!header.projectId) {
      // Soft confirm — writing off to "void" is legal but rarely intended.
      const proceed = window.confirm(
        'Объект не выбран — себестоимость не будет привязана к проекту. Продолжить?',
      );
      if (!proceed) return;
    }

    // Encode the rich header into note since the legacy table has no
    // dedicated columns for brigade / responsible / reason.
    const brigadeName = header.brigadeId
      ? brigades?.data?.find((b) => b.id === header.brigadeId)?.name
      : undefined;
    const employeeName = header.employeeId
      ? employees?.data?.find((e) => e.id === header.employeeId)?.fullName
      : undefined;
    const projectName = header.projectId
      ? projects?.data?.find((p) => p.id === header.projectId)?.name
      : undefined;

    const headerBits: string[] = [
      header.reason ? `Причина: ${REASON_LABEL[header.reason]}` : null,
      projectName ? `Объект: ${projectName}` : null,
      brigadeName ? `Бригада: ${brigadeName}` : null,
      employeeName ? `Отв.: ${employeeName}` : null,
      `от ${header.date.format('DD.MM.YYYY')}`,
      header.comment || null,
    ].filter((x): x is string => Boolean(x));
    const headerNote = headerBits.join(' · ');

    const movements = valid.map((l) => ({
      itemId: l.itemId!,
      warehouseId: header.warehouseId!,
      movementType: 'WRITE_OFF' as const,
      qty: Number(l.qty),
      // Don't override unitCost — backend uses WAC. We pass it only when
      // it differs from current avgCost for audit purposes; otherwise let
      // the server compute. Keeping out for safety.
      projectId: header.projectId,
      note: [headerNote, l.comment?.trim() || null].filter(Boolean).join(' — '),
    }));

    try {
      await mutation.mutateAsync(movements);
      pushRecent(valid.map((l) => l.itemId!));
      message.success(
        `Списано: ${valid.length} поз. · ${formatMoney(totals.amount)}`,
      );
      close();
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string; message?: string } } })?.response
          ?.data?.detail ??
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Не удалось списать';
      message.error(typeof detail === 'string' ? detail : 'Не удалось списать');
    }
  };

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <Button icon={<ExportOutlined />} onClick={() => setOpen(true)}>
          Списание
        </Button>
      )}
      <FormModal
        title="Списание материалов"
        subtitle="Цена списания берётся из текущей себестоимости (WAC). Объект и бригада нужны для аналитики и P&L."
        open={open}
        onClose={close}
        width={1100}
        dirty={dirty || lines.some((l) => l.itemId)}
        onSubmit={handleSubmit}
        footer={
          <div className="wrof-footer">
            <div className="wrof-footer__totals">
              <div className="wrof-footer__cell">
                <span className="wrof-footer__label">Позиций</span>
                <strong>{totals.positions}</strong>
              </div>
              <div className="wrof-footer__cell">
                <span className="wrof-footer__label">Общее кол-во</span>
                <strong>{formatNumber(totals.qty)}</strong>
              </div>
              <div className="wrof-footer__cell wrof-footer__cell--total">
                <span className="wrof-footer__label">Себестоимость</span>
                <strong style={{ color: 'var(--finance-expense, #cf1322)' }}>
                  {formatMoney(totals.amount)}
                </strong>
              </div>
              {totals.overdraft && (
                <Tag color="red" icon={<WarningOutlined />}>
                  Превышен остаток
                </Tag>
              )}
            </div>
            <Space>
              <Button onClick={close}>Отмена</Button>
              <Button
                type="primary"
                danger
                size="large"
                loading={mutation.isPending}
                onClick={handleSubmit}
                disabled={totals.overdraft}
              >
                Списать
              </Button>
            </Space>
          </div>
        }
      >
        <div className="wrof-body">
          {/* ── Header block ─────────────────────────────── */}
          <Form<HeaderShape>
            form={headerForm}
            layout="vertical"
            requiredMark={false}
            initialValues={{
              date: dayjs(),
              warehouseId: defaultWarehouse,
              projectId: defaultProject,
              reason: 'CONSUMED',
            }}
            className="wrof-header"
          >
            <Row gutter={12}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="warehouseId"
                  label="Со склада"
                  rules={[{ required: true, message: 'Выберите склад' }]}
                >
                  <WarehouseSelect />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="projectId" label="На объект">
                  <ProjectSelect placeholder="Без объекта" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="brigadeId" label="Бригада">
                  <BrigadeSelect placeholder="Не выбрана" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="employeeId" label="Ответственный">
                  <EmployeeSelect placeholder="Не выбран" />
                </Form.Item>
              </Col>
              <Col xs={24} md={5}>
                <Form.Item
                  name="reason"
                  label="Причина"
                  rules={[{ required: true }]}
                >
                  <Select options={REASON_OPTIONS} />
                </Form.Item>
              </Col>
              <Col xs={24} md={5}>
                <Form.Item
                  name="date"
                  label="Дата"
                  rules={[{ required: true }]}
                >
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="comment" label="Комментарий">
                  <Input placeholder="Например: блок А, 3-й этаж" />
                </Form.Item>
              </Col>
            </Row>
          </Form>

          {/* ── Recent / frequently used materials chips ───── */}
          {recentItems.length > 0 && (
            <div className="wrof-recent">
              <ThunderboltOutlined className="wrof-recent__icon" />
              <span className="wrof-recent__label">Часто списываемые:</span>
              <div className="wrof-recent__chips">
                {recentItems.slice(0, 8).map((it) => (
                  <Tag
                    key={it.id}
                    color="orange"
                    className="wrof-recent__chip"
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
          <div className="wrof-table" role="grid">
            <div className="wrof-table__head">
              <div className="wrof-col wrof-col--num">#</div>
              <div className="wrof-col wrof-col--material">Материал</div>
              <div className="wrof-col wrof-col--unit">Ед.</div>
              <div className="wrof-col wrof-col--avail">Остаток</div>
              <div className="wrof-col wrof-col--qty">Списать</div>
              <div className="wrof-col wrof-col--price">Цена (WAC)</div>
              <div className="wrof-col wrof-col--sum">Себестоим.</div>
              <div className="wrof-col wrof-col--comment">Комментарий</div>
              <div className="wrof-col wrof-col--actions" />
            </div>
            {lines.map((line, idx) => {
              const qty = Number(line.qty ?? 0);
              const sum = qty * Number(line.unitCost ?? 0);
              const over =
                line.available !== undefined && qty > line.available;
              return (
                <div
                  key={line.uid}
                  data-line-uid={line.uid}
                  ref={idx === 0 ? firstLineRef : null}
                  className={`wrof-table__row${over ? ' wrof-table__row--over' : ''}`}
                  role="row"
                >
                  <div className="wrof-col wrof-col--num">{idx + 1}</div>
                  <div className="wrof-col wrof-col--material">
                    <MaterialSelect
                      value={line.itemId}
                      warehouseId={warehouseId}
                      onChange={(id, meta) =>
                        pickMaterial(line.uid, id, meta ? { unit: meta.unit } : undefined)
                      }
                      placeholder={
                        warehouseId ? 'Выберите материал' : 'Сначала выберите склад'
                      }
                      size="small"
                    />
                  </div>
                  <div className="wrof-col wrof-col--unit">
                    <span>{line.unit ?? '—'}</span>
                  </div>
                  <div className="wrof-col wrof-col--avail">
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
                  <div className="wrof-col wrof-col--qty">
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
                  <div className="wrof-col wrof-col--price">
                    <span style={{ color: 'var(--ant-color-text-secondary, #8c8c8c)' }}>
                      {line.unitCost
                        ? formatMoney(line.unitCost)
                        : '—'}
                    </span>
                  </div>
                  <div className="wrof-col wrof-col--sum">
                    <strong style={{ color: over ? '#cf1322' : undefined }}>
                      {sum > 0 ? formatMoney(sum) : '—'}
                    </strong>
                  </div>
                  <div className="wrof-col wrof-col--comment">
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
                  <div className="wrof-col wrof-col--actions">
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

          <div className="wrof-actions">
            <Button onClick={addLine} icon={<PlusOutlined />} type="dashed">
              Добавить строку (Enter)
            </Button>
          </div>
        </div>
      </FormModal>
    </>
  );
}
