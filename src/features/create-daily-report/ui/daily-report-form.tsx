'use client';

import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
} from 'antd';
import { message } from '@shared/lib/antd-static';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useCreateDailyReport } from '@entities/daily-report/hooks';
import type {
  CreateDailyReportPayload,
  DailyReportAttendanceInput,
  DailyReportMaterialInput,
  DailyReportWorkInput,
} from '@entities/daily-report/types';
import { PhotoUploader, UploadedPhoto } from '@features/upload-document/ui/photo-uploader';

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

const WORK_TYPES = [
  'CONCRETE',
  'FOUNDATION',
  'MASONRY',
  'PLASTER',
  'ROOFING',
  'PLUMBING',
  'ELECTRICAL',
  'WELDING',
  'FINISHING',
  'EARTHWORKS',
  'OTHER',
] as const;

const UNITS = ['M3', 'M2', 'M', 'HOUR', 'SHIFT', 'PIECE'] as const;
const ATT_STATUSES = ['PRESENT', 'LATE', 'ABSENT', 'SICK_LEAVE', 'DAY_OFF'] as const;

export function DailyReportForm({ projectId, onDone }: Props) {
  const [form] = Form.useForm<FormShape>();
  const mutation = useCreateDailyReport(projectId);

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

  return (
    <Form<FormShape>
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ date: dayjs() }}
    >
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item name="date" label="Дата" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="brigadeId" label="Бригада (опционально)">
            <Input placeholder="ID бригады" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="foremanId" label="Прораб (если не текущий)">
            <Input placeholder="ID сотрудника-прораба" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="summary" label="Что сделали">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="problems" label="Проблемы">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">Работы</Divider>
      <Form.List name="works">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <Card key={field.key} size="small" className="mb-3" bordered>
                <Row gutter={12} align="middle">
                  <Col xs={12} md={4}>
                    <Form.Item
                      name={[field.name, 'workType']}
                      label="Тип"
                      rules={[{ required: true }]}
                    >
                      <Select options={WORK_TYPES.map((v) => ({ value: v, label: v }))} />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={3}>
                    <Form.Item
                      name={[field.name, 'unit']}
                      label="Ед."
                      rules={[{ required: true }]}
                    >
                      <Select options={UNITS.map((v) => ({ value: v, label: v }))} />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Item
                      name={[field.name, 'volume']}
                      label="Объём"
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Item
                      name={[field.name, 'price']}
                      label="Цена"
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={7}>
                    <Form.Item name={[field.name, 'employeeId']} label="Исполнитель (id)">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={1}>
                    <Button
                      type="text"
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(field.name)}
                    />
                  </Col>
                </Row>
              </Card>
            ))}
            <Button onClick={() => add()} icon={<PlusOutlined />}>
              Добавить работу
            </Button>
          </>
        )}
      </Form.List>

      <Divider orientation="left">Материалы (списание)</Divider>
      <Form.List name="materials">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <Row key={field.key} gutter={12} align="middle" className="mb-2">
                <Col xs={24} md={12}>
                  <Form.Item
                    name={[field.name, 'itemId']}
                    label="ID товара"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={12} md={5}>
                  <Form.Item
                    name={[field.name, 'qty']}
                    label="Кол-во"
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name={[field.name, 'unitCost']} label="Цена (опц.)">
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={1}>
                  <Button
                    type="text"
                    icon={<MinusCircleOutlined />}
                    onClick={() => remove(field.name)}
                  />
                </Col>
              </Row>
            ))}
            <Button onClick={() => add()} icon={<PlusOutlined />}>
              Добавить материал
            </Button>
          </>
        )}
      </Form.List>

      <Divider orientation="left">Посещаемость</Divider>
      <Form.List name="attendance">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <Row key={field.key} gutter={12} align="middle" className="mb-2">
                <Col xs={24} md={12}>
                  <Form.Item
                    name={[field.name, 'employeeId']}
                    label="ID сотрудника"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={12} md={5}>
                  <Form.Item name={[field.name, 'hours']} label="Часы">
                    <InputNumber min={0} max={24} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name={[field.name, 'status']} label="Статус">
                    <Select options={ATT_STATUSES.map((v) => ({ value: v, label: v }))} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={1}>
                  <Button
                    type="text"
                    icon={<MinusCircleOutlined />}
                    onClick={() => remove(field.name)}
                  />
                </Col>
              </Row>
            ))}
            <Button onClick={() => add()} icon={<PlusOutlined />}>
              Добавить запись
            </Button>
          </>
        )}
      </Form.List>

      <Divider orientation="left">Фото</Divider>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="photosBefore"
            label="До работы"
            valuePropName="value"
            trigger="onChange"
          >
            <PhotoUploader projectId={projectId} hint="JPEG/PNG/WEBP, до 10 МБ" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="photosAfter"
            label="После работы"
            valuePropName="value"
            trigger="onChange"
          >
            <PhotoUploader projectId={projectId} hint="JPEG/PNG/WEBP, до 10 МБ" />
          </Form.Item>
        </Col>
      </Row>

      <Divider />
      <Space>
        <Button type="primary" htmlType="submit" loading={mutation.isPending}>
          Сохранить отчёт
        </Button>
      </Space>
    </Form>
  );
}
