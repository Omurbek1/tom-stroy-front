'use client';

import {
  Alert,
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
} from 'antd';
import { message } from '@shared/lib/antd-static';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { memo, useMemo } from 'react';
import { useCreateDailyReport } from '@entities/daily-report/hooks';
import type {
  CreateDailyReportPayload,
  DailyReportAttendanceInput,
  DailyReportMaterialInput,
  DailyReportWorkInput,
  WorkUnit,
} from '@entities/daily-report/types';
import { PhotoUploader, UploadedPhoto } from '@features/upload-document/ui/photo-uploader';
import { FormSection } from '@shared/ui/form-section';
import { EmployeeSelect } from '@shared/ui/employee-select';
import { BrigadeSelect } from '@shared/ui/brigade-select';
import { MaterialSelect } from '@shared/ui/material-select';
import { WorkTypeSelect } from '@shared/ui/work-type-select';
import { DEFAULT_UNIT_FOR_TYPE } from '@shared/constants/work-type';
import { WORK_UNIT_OPTIONS, formatWorkUnit } from '@shared/constants/work-unit';
import { ATTENDANCE_STATUS_OPTIONS } from '@shared/constants/attendance-status';
import { formatMoney } from '@shared/lib/format';

interface Props {
  projectId: string;
  onDone?: () => void;
}

interface FormShape {
  date: Dayjs;
  brigadeId?: string;
  foremanId?: string;
  summary?: string;
  problems?: string;
  works?: DailyReportWorkInput[];
  materials?: DailyReportMaterialInput[];
  attendance?: DailyReportAttendanceInput[];
  photosBefore?: UploadedPhoto[];
  photosAfter?: UploadedPhoto[];
}

interface WorkRowProps {
  fieldKey: number;
  onRemove: () => void;
}

const WorkRow = memo(function WorkRow({ fieldKey, onRemove }: WorkRowProps) {
  const form = Form.useFormInstance<FormShape>();
  const work = Form.useWatch<DailyReportWorkInput | undefined>(['works', fieldKey]);
  const volume = Number(work?.volume ?? 0);
  const price = Number(work?.price ?? 0);
  const amount = volume * price;
  const unit = work?.unit;

  return (
    <Row gutter={8} align="top" wrap={false} style={{ marginBottom: 8 }}>
      <Col flex="200px">
        <Form.Item
          name={[fieldKey, 'workType']}
          rules={[{ required: true, message: '' }]}
          style={{ marginBottom: 0 }}
        >
          <WorkTypeSelect
            onChange={(type) => {
              const works = form.getFieldValue('works') as DailyReportWorkInput[] | undefined;
              if (!works || !type) return;
              const current = works[fieldKey];
              if (!current?.unit) {
                const next = [...works];
                next[fieldKey] = { ...current, workType: type, unit: DEFAULT_UNIT_FOR_TYPE[type] };
                form.setFieldValue('works', next);
              }
            }}
          />
        </Form.Item>
      </Col>
      <Col flex="90px">
        <Form.Item
          name={[fieldKey, 'unit']}
          rules={[{ required: true, message: '' }]}
          style={{ marginBottom: 0 }}
        >
          <Select options={WORK_UNIT_OPTIONS} />
        </Form.Item>
      </Col>
      <Col flex="110px">
        <Form.Item
          name={[fieldKey, 'volume']}
          rules={[{ required: true, message: '' }, { type: 'number', min: 0.01 }]}
          style={{ marginBottom: 0 }}
        >
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            placeholder="Объём"
            addonAfter={unit ? formatWorkUnit(unit) : undefined}
          />
        </Form.Item>
      </Col>
      <Col flex="130px">
        <Form.Item
          name={[fieldKey, 'price']}
          rules={[{ required: true, message: '' }, { type: 'number', min: 0 }]}
          style={{ marginBottom: 0 }}
        >
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            placeholder="Цена"
            addonAfter="₸"
            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
          />
        </Form.Item>
      </Col>
      <Col flex="auto">
        <Form.Item name={[fieldKey, 'employeeId']} style={{ marginBottom: 0 }}>
          <EmployeeSelect placeholder="Исполнитель" />
        </Form.Item>
      </Col>
      <Col flex="140px" style={{ textAlign: 'right', paddingTop: 6 }}>
        <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{formatMoney(amount)}</strong>
      </Col>
      <Col flex="32px" style={{ paddingTop: 2 }}>
        <Button type="text" icon={<DeleteOutlined />} danger onClick={onRemove} />
      </Col>
    </Row>
  );
});

interface MaterialRowProps {
  fieldKey: number;
  onRemove: () => void;
}

const MaterialRow = memo(function MaterialRow({ fieldKey, onRemove }: MaterialRowProps) {
  const form = Form.useFormInstance<FormShape>();
  const item = Form.useWatch<DailyReportMaterialInput | undefined>(['materials', fieldKey]);

  return (
    <Row gutter={8} align="top" wrap={false} style={{ marginBottom: 8 }}>
      <Col flex="auto">
        <Form.Item
          name={[fieldKey, 'itemId']}
          rules={[{ required: true, message: '' }]}
          style={{ marginBottom: 0 }}
        >
          <MaterialSelect
            onChange={(id, meta) => {
              const materials = form.getFieldValue('materials') as
                | DailyReportMaterialInput[]
                | undefined;
              if (!materials) return;
              const next = [...materials];
              next[fieldKey] = {
                ...next[fieldKey],
                itemId: id ?? '',
                unitCost: meta?.costPrice ?? next[fieldKey]?.unitCost,
              };
              form.setFieldValue('materials', next);
            }}
          />
        </Form.Item>
      </Col>
      <Col flex="120px">
        <Form.Item
          name={[fieldKey, 'qty']}
          rules={[{ required: true, message: '' }, { type: 'number', min: 0.01 }]}
          style={{ marginBottom: 0 }}
        >
          <InputNumber min={0} style={{ width: '100%' }} placeholder="Кол-во" />
        </Form.Item>
      </Col>
      <Col flex="140px">
        <Form.Item name={[fieldKey, 'unitCost']} style={{ marginBottom: 0 }}>
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            placeholder="Цена"
            addonAfter="₸"
            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
          />
        </Form.Item>
      </Col>
      <Col flex="140px" style={{ textAlign: 'right', paddingTop: 6 }}>
        <strong style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatMoney(Number(item?.qty ?? 0) * Number(item?.unitCost ?? 0))}
        </strong>
      </Col>
      <Col flex="32px" style={{ paddingTop: 2 }}>
        <Button type="text" icon={<DeleteOutlined />} danger onClick={onRemove} />
      </Col>
    </Row>
  );
});

interface AttendanceRowProps {
  fieldKey: number;
  onRemove: () => void;
}

const AttendanceRow = memo(function AttendanceRow({ fieldKey, onRemove }: AttendanceRowProps) {
  return (
    <Row gutter={8} align="top" wrap={false} style={{ marginBottom: 8 }}>
      <Col flex="auto">
        <Form.Item
          name={[fieldKey, 'employeeId']}
          rules={[{ required: true, message: '' }]}
          style={{ marginBottom: 0 }}
        >
          <EmployeeSelect />
        </Form.Item>
      </Col>
      <Col flex="120px">
        <Form.Item name={[fieldKey, 'hours']} style={{ marginBottom: 0 }}>
          <InputNumber
            min={0}
            max={24}
            style={{ width: '100%' }}
            placeholder="Часы"
            addonAfter="ч"
          />
        </Form.Item>
      </Col>
      <Col flex="170px">
        <Form.Item name={[fieldKey, 'status']} style={{ marginBottom: 0 }}>
          <Select options={ATTENDANCE_STATUS_OPTIONS} placeholder="Статус" />
        </Form.Item>
      </Col>
      <Col flex="32px" style={{ paddingTop: 2 }}>
        <Button type="text" icon={<DeleteOutlined />} danger onClick={onRemove} />
      </Col>
    </Row>
  );
});

function RowHeader({ cells }: { cells: Array<{ flex: string; label: string; align?: 'left' | 'right' }> }) {
  return (
    <Row gutter={8} wrap={false} style={{ marginBottom: 6 }}>
      {cells.map((c, i) => (
        <Col
          key={i}
          flex={c.flex}
          style={{
            fontSize: 12,
            color: 'var(--ant-color-text-secondary, #8c8c8c)',
            textAlign: c.align ?? 'left',
            paddingLeft: c.align === 'right' ? 0 : 4,
            paddingRight: c.align === 'right' ? 8 : 0,
          }}
        >
          {c.label}
        </Col>
      ))}
    </Row>
  );
}

export function DailyReportForm({ projectId, onDone }: Props) {
  const [form] = Form.useForm<FormShape>();
  const mutation = useCreateDailyReport(projectId);

  const works = Form.useWatch('works', form);
  const totalWorks = useMemo(
    () =>
      (works ?? []).reduce(
        (s: number, w: DailyReportWorkInput | undefined) =>
          s + Number(w?.volume ?? 0) * Number(w?.price ?? 0),
        0,
      ),
    [works],
  );

  const onFinish = async (values: FormShape) => {
    const photos = [
      ...(values.photosBefore ?? []).map((p) => ({
        kind: 'before' as const,
        storageKey: p.storageKey,
      })),
      ...(values.photosAfter ?? []).map((p) => ({
        kind: 'after' as const,
        storageKey: p.storageKey,
      })),
    ];

    const payload: CreateDailyReportPayload = {
      projectId,
      date: values.date.toISOString(),
      brigadeId: values.brigadeId,
      foremanId: values.foremanId,
      summary: values.summary,
      problems: values.problems,
      works: values.works,
      materials: values.materials,
      attendance: values.attendance,
      photos: photos.length ? photos : undefined,
    };
    try {
      await mutation.mutateAsync(payload);
      message.success('Отчёт сохранён');
      form.resetFields();
      onDone?.();
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Ошибка сохранения отчёта';
      message.error(typeof detail === 'string' ? detail : 'Ошибка сохранения отчёта');
    }
  };

  const workHeaderCells = [
    { flex: '200px', label: 'Тип работ' },
    { flex: '90px', label: 'Ед.' },
    { flex: '110px', label: 'Объём' },
    { flex: '130px', label: 'Цена' },
    { flex: 'auto', label: 'Исполнитель' },
    { flex: '140px', label: 'Сумма', align: 'right' as const },
    { flex: '32px', label: '' },
  ];
  const materialHeaderCells = [
    { flex: 'auto', label: 'Материал' },
    { flex: '120px', label: 'Кол-во' },
    { flex: '140px', label: 'Цена' },
    { flex: '140px', label: 'Сумма', align: 'right' as const },
    { flex: '32px', label: '' },
  ];
  const attHeaderCells = [
    { flex: 'auto', label: 'Сотрудник' },
    { flex: '120px', label: 'Часы' },
    { flex: '170px', label: 'Статус' },
    { flex: '32px', label: '' },
  ];

  return (
    <Form<FormShape>
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ date: dayjs() }}
      requiredMark={false}
    >
      <FormSection title="Основная информация">
        <Row gutter={12}>
          <Col xs={24} md={8}>
            <Form.Item name="date" label="Дата" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="brigadeId" label="Бригада">
              <BrigadeSelect />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="foremanId" label="Прораб">
              <EmployeeSelect roleFilter={['FOREMAN']} placeholder="По умолчанию — текущий" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item name="summary" label="Что сделали">
              <Input.TextArea
                autoSize={{ minRows: 2, maxRows: 6 }}
                placeholder="Залили фундамент блока A, выполнено 24 м³ бетона. Бригада 6 человек."
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="problems" label="Проблемы / задержки">
              <Input.TextArea
                autoSize={{ minRows: 2, maxRows: 6 }}
                placeholder="Опоздание поставки арматуры на 3 часа, простой бригады."
              />
            </Form.Item>
          </Col>
        </Row>
      </FormSection>

      <FormSection
        title="Работы"
        extra={
          totalWorks > 0 && <Tag color="blue">Итого: {formatMoney(totalWorks)}</Tag>
        }
      >
        <Form.List name="works">
          {(fields, { add, remove }) => (
            <>
              {fields.length > 0 && <RowHeader cells={workHeaderCells} />}
              {fields.map((field) => (
                <WorkRow key={field.key} fieldKey={field.name} onRemove={() => remove(field.name)} />
              ))}
              <Button
                onClick={() => add({ unit: 'M3' as WorkUnit })}
                icon={<PlusOutlined />}
                type="dashed"
                block
                style={{ marginTop: fields.length > 0 ? 4 : 0 }}
              >
                Добавить работу
              </Button>
            </>
          )}
        </Form.List>
      </FormSection>

      <FormSection title="Материалы" subtitle="Списание со склада">
        <Form.List name="materials">
          {(fields, { add, remove }) => (
            <>
              {fields.length > 0 && <RowHeader cells={materialHeaderCells} />}
              {fields.map((field) => (
                <MaterialRow
                  key={field.key}
                  fieldKey={field.name}
                  onRemove={() => remove(field.name)}
                />
              ))}
              <Button
                onClick={() => add()}
                icon={<PlusOutlined />}
                type="dashed"
                block
                style={{ marginTop: fields.length > 0 ? 4 : 0 }}
              >
                Добавить материал
              </Button>
            </>
          )}
        </Form.List>
      </FormSection>

      <FormSection title="Посещаемость">
        <Form.List name="attendance">
          {(fields, { add, remove }) => (
            <>
              {fields.length > 0 && <RowHeader cells={attHeaderCells} />}
              {fields.map((field) => (
                <AttendanceRow
                  key={field.key}
                  fieldKey={field.name}
                  onRemove={() => remove(field.name)}
                />
              ))}
              <Button
                onClick={() => add({ status: 'PRESENT', hours: 8 })}
                icon={<PlusOutlined />}
                type="dashed"
                block
                style={{ marginTop: fields.length > 0 ? 4 : 0 }}
              >
                Добавить сотрудника
              </Button>
            </>
          )}
        </Form.List>
      </FormSection>

      <FormSection title="Фото" subtitle="JPEG/PNG/WEBP, до 10 МБ">
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item
              name="photosBefore"
              label="До работ"
              valuePropName="value"
              trigger="onChange"
              style={{ marginBottom: 0 }}
            >
              <PhotoUploader projectId={projectId} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="photosAfter"
              label="После работ"
              valuePropName="value"
              trigger="onChange"
              style={{ marginBottom: 0 }}
            >
              <PhotoUploader projectId={projectId} />
            </Form.Item>
          </Col>
        </Row>
      </FormSection>

      {mutation.isError && (
        <Alert
          type="error"
          showIcon
          message="Не удалось сохранить отчёт"
          style={{ marginBottom: 12 }}
        />
      )}

      <div
        style={{
          position: 'sticky',
          bottom: -20,
          marginLeft: -20,
          marginRight: -20,
          marginBottom: -20,
          marginTop: 8,
          padding: '12px 20px',
          background: 'var(--ant-color-bg-container, #fff)',
          borderTop: '1px solid var(--ant-color-border-secondary, #f0f0f0)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          zIndex: 2,
        }}
      >
        <Space size="small">
          <span style={{ fontSize: 12, color: 'var(--ant-color-text-secondary, #8c8c8c)' }}>
            {(works ?? []).length > 0 && `Работ: ${(works ?? []).length}`}
          </span>
        </Space>
        <Space>
          <Button onClick={onDone}>Отмена</Button>
          <Button type="primary" htmlType="submit" loading={mutation.isPending}>
            Сохранить отчёт
          </Button>
        </Space>
      </div>
    </Form>
  );
}
