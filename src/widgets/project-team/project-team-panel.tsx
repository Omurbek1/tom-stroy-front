'use client';

import { useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Empty,
  Popconfirm,
  Segmented,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
} from 'antd';
import { useQuery } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import {
  UserAddOutlined,
  TeamOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { message } from '@shared/lib/antd-static';
import { FormModal } from '@shared/ui/form-modal';
import { EmployeeSelect } from '@shared/ui/employee-select';
import { BrigadeSelect } from '@shared/ui/brigade-select';
import { EmployeeFormDrawer } from '@features/edit-employee/ui/employee-form-drawer';
import { CreateBrigadeModal } from '@features/create-brigade/ui/create-brigade-button';
import { useAuthStore } from '@app-init/store/auth-store';
import { can } from '@shared/config/permissions';
import { formatDate } from '@shared/lib/format';
import {
  useAddProjectMember,
  useAddProjectMembersBulk,
  useProjectMembers,
  useRemoveProjectMember,
  useUpdateProjectMember,
} from '@entities/project-member/hooks';
import type {
  ProjectMember,
  ProjectMemberRole,
} from '@entities/project-member/types';
import { getBrigade } from '@entities/brigade/api';
import { brigadeKeys } from '@entities/brigade/hooks';
import './project-team-panel.css';

const ROLE_OPTIONS: { value: ProjectMemberRole; label: string; color: string }[] = [
  { value: 'FOREMAN', label: 'Прораб', color: 'gold' },
  { value: 'MASTER', label: 'Мастер', color: 'blue' },
  { value: 'WORKER', label: 'Работник', color: 'default' },
  { value: 'OBSERVER', label: 'Наблюдатель', color: 'purple' },
];

const ROLE_META = Object.fromEntries(ROLE_OPTIONS.map((r) => [r.value, r])) as Record<
  ProjectMemberRole,
  (typeof ROLE_OPTIONS)[number]
>;

interface Props {
  projectId: string;
}

export function ProjectTeamPanel({ projectId }: Props) {
  const role = useAuthStore((s) => s.user?.role);
  const canEdit = can(role, 'object:team:edit');

  const { data, isLoading } = useProjectMembers(projectId);
  const addMember = useAddProjectMember(projectId);
  const addBulk = useAddProjectMembersBulk(projectId);
  const updateMember = useUpdateProjectMember(projectId);
  const removeMember = useRemoveProjectMember(projectId);

  const [addOpen, setAddOpen] = useState(false);
  const [addEmployeeId, setAddEmployeeId] = useState<string>();
  const [addRole, setAddRole] = useState<ProjectMemberRole>('WORKER');

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkBrigadeId, setBulkBrigadeId] = useState<string>();
  const [bulkRole, setBulkRole] = useState<ProjectMemberRole>('WORKER');
  const [bulkLoading, setBulkLoading] = useState(false);

  const [createEmployeeOpen, setCreateEmployeeOpen] = useState(false);
  const [createBrigadeOpen, setCreateBrigadeOpen] = useState(false);

  const members = data ?? [];

  const handleAdd = async () => {
    if (!addEmployeeId) return;
    try {
      await addMember.mutateAsync({ employeeId: addEmployeeId, role: addRole });
      message.success('Добавлен в команду');
      setAddOpen(false);
      setAddEmployeeId(undefined);
      setAddRole('WORKER');
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? // @ts-expect-error axios shape
            e.response?.data?.message
          : null;
      message.error(msg ?? 'Не удалось добавить');
    }
  };

  const handleBulk = async () => {
    if (!bulkBrigadeId) return;
    setBulkLoading(true);
    try {
      const brigade = await getBrigade(bulkBrigadeId);
      const employeeIds = brigade.members.map((m) => m.employee.id);
      if (employeeIds.length === 0) {
        message.warning('В бригаде нет сотрудников');
        return;
      }
      const result = await addBulk.mutateAsync({ employeeIds, role: bulkRole });
      message.success(
        `Добавлено ${result.added}, восстановлено ${result.revived}, пропущено ${
          employeeIds.length - result.added - result.revived
        }`,
      );
      setBulkOpen(false);
      setBulkBrigadeId(undefined);
      setBulkRole('WORKER');
    } catch {
      message.error('Не удалось добавить бригаду');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleRoleChange = async (employeeId: string, role: ProjectMemberRole) => {
    try {
      await updateMember.mutateAsync({ employeeId, role });
      message.success('Роль обновлена');
    } catch {
      message.error('Не удалось обновить роль');
    }
  };

  const handleRemove = async (employeeId: string) => {
    try {
      await removeMember.mutateAsync(employeeId);
      message.success('Удалён из команды');
    } catch {
      message.error('Не удалось удалить');
    }
  };

  const columns: ColumnsType<ProjectMember> = useMemo(
    () => [
      {
        title: 'Сотрудник',
        key: 'employee',
        render: (_, r) => (
          <Space>
            <Avatar size="small" src={r.employee.photoUrl ?? undefined}>
              {r.employee.fullName.charAt(0)}
            </Avatar>
            <div>
              <div style={{ fontWeight: 500 }}>{r.employee.fullName}</div>
              {r.employee.phone && (
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--ant-color-text-secondary, #8c8c8c)',
                  }}
                >
                  {r.employee.phone}
                </div>
              )}
            </div>
          </Space>
        ),
      },
      {
        title: 'Роль на объекте',
        dataIndex: 'role',
        key: 'role',
        width: 200,
        render: (value: ProjectMemberRole, r) =>
          canEdit ? (
            <Select<ProjectMemberRole>
              value={value}
              size="small"
              style={{ width: '100%' }}
              options={ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              onChange={(v) => handleRoleChange(r.employeeId, v)}
            />
          ) : (
            <Tag color={ROLE_META[value]?.color}>{ROLE_META[value]?.label ?? value}</Tag>
          ),
      },
      {
        title: 'С',
        dataIndex: 'assignedAt',
        key: 'assignedAt',
        width: 140,
        render: (v: string) => formatDate(v),
      },
      ...(canEdit
        ? ([
            {
              title: '',
              key: 'actions',
              width: 60,
              align: 'right' as const,
              render: (_: unknown, r: ProjectMember) => (
                <Popconfirm
                  title="Убрать из команды?"
                  onConfirm={() => handleRemove(r.employeeId)}
                  okButtonProps={{ danger: true }}
                >
                  <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              ),
            },
          ] as ColumnsType<ProjectMember>)
        : []),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canEdit],
  );

  return (
    <>
      <Card
        title={`Состав команды (${members.length})`}
        extra={
          canEdit && (
            <Space>
              <Button icon={<TeamOutlined />} onClick={() => setBulkOpen(true)}>
                Добавить бригаду
              </Button>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => setAddOpen(true)}
              >
                Добавить сотрудника
              </Button>
            </Space>
          )
        }
      >
        {isLoading ? (
          <Skeleton active />
        ) : members.length === 0 ? (
          <Empty description="В команде пока никого нет. Добавьте сотрудника или целую бригаду." />
        ) : (
          <Table<ProjectMember>
            rowKey={(r) => r.employeeId}
            size="small"
            columns={columns}
            dataSource={members}
            pagination={false}
          />
        )}
      </Card>

      <FormModal
        title="Добавить сотрудника в команду"
        subtitle="Сотрудник появится в составе команды объекта и сможет получать наряды"
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAdd}
        width={720}
        footer={
          <Button
            type="primary"
            size="large"
            block
            loading={addMember.isPending}
            disabled={!addEmployeeId}
            onClick={handleAdd}
          >
            Добавить в команду
          </Button>
        }
      >
        <div className="team-modal-body">
          <FieldRow
            label="Сотрудник"
            required
            action={
              <Button
                type="link"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setCreateEmployeeOpen(true)}
              >
                Создать нового
              </Button>
            }
          >
            <EmployeeSelect
              value={addEmployeeId}
              onChange={setAddEmployeeId}
              size="large"
            />
          </FieldRow>
          <FieldRow
            label="Роль на объекте"
            hint="Прораб ведёт отчёты, наблюдатель имеет только просмотр"
          >
            <Segmented<ProjectMemberRole>
              block
              size="large"
              value={addRole}
              onChange={(v) => setAddRole(v)}
              options={ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
          </FieldRow>
        </div>
      </FormModal>

      <FormModal
        title="Добавить бригаду целиком"
        subtitle="Все активные участники выбранной бригады попадут в команду объекта"
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onSubmit={handleBulk}
        width={720}
        footer={
          <Button
            type="primary"
            size="large"
            block
            loading={bulkLoading || addBulk.isPending}
            disabled={!bulkBrigadeId}
            onClick={handleBulk}
          >
            Добавить бригаду
          </Button>
        }
      >
        <div className="team-modal-body">
          <FieldRow
            label="Бригада"
            required
            action={
              <Button
                type="link"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setCreateBrigadeOpen(true)}
              >
                Создать новую
              </Button>
            }
          >
            <BrigadeSelect
              value={bulkBrigadeId}
              onChange={setBulkBrigadeId}
              size="large"
            />
          </FieldRow>
          <BrigadePreview brigadeId={bulkBrigadeId} />
          <FieldRow label="Роль для всех" hint="Можно изменить индивидуально позже">
            <Segmented<ProjectMemberRole>
              block
              size="large"
              value={bulkRole}
              onChange={(v) => setBulkRole(v)}
              options={ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
          </FieldRow>
        </div>
      </FormModal>

      <EmployeeFormDrawer
        employee={null}
        open={createEmployeeOpen}
        onClose={() => setCreateEmployeeOpen(false)}
        onCreated={(emp) => setAddEmployeeId(emp.id)}
      />
      <CreateBrigadeModal
        open={createBrigadeOpen}
        onClose={() => setCreateBrigadeOpen(false)}
        onCreated={(b) => setBulkBrigadeId(b.id)}
      />
    </>
  );
}

function FieldRow({
  label,
  hint,
  required,
  action,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="team-field">
      <div className="team-field__head">
        <div className="team-field__label">
          {label}
          {required && <span className="team-field__req">*</span>}
        </div>
        {action}
      </div>
      <div className="team-field__control">{children}</div>
      {hint && <div className="team-field__hint">{hint}</div>}
    </div>
  );
}

function BrigadePreview({ brigadeId }: { brigadeId?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: brigadeId ? brigadeKeys.detail(brigadeId) : ['brigades', 'preview-empty'],
    queryFn: () => getBrigade(brigadeId as string),
    enabled: Boolean(brigadeId),
  });
  if (!brigadeId) return null;
  if (isLoading) return <Skeleton.Input active style={{ width: '100%' }} />;
  if (!data) return null;
  const members = data.members ?? [];
  return (
    <div className="team-preview">
      <div className="team-preview__head">
        <span className="team-preview__title">{data.name}</span>
        {data.specialization && (
          <Tag color="blue">{data.specialization}</Tag>
        )}
        <span className="team-preview__count">{members.length} чел.</span>
      </div>
      {members.length > 0 ? (
        <div className="team-preview__members">
          {members.slice(0, 8).map((m) => (
            <Tag key={m.id}>{m.employee.fullName}</Tag>
          ))}
          {members.length > 8 && (
            <Tag color="default">+{members.length - 8}</Tag>
          )}
        </div>
      ) : (
        <div className="team-preview__empty">В бригаде нет сотрудников</div>
      )}
    </div>
  );
}
