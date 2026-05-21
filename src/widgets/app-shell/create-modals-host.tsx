'use client';

import { useEffect, useState } from 'react';
import { useCreateModalStore, CreateModalKind } from '@app-init/store/create-modal-store';
import { FormModal } from '@shared/ui/form-modal';
import { ProjectForm } from '@features/create-project/ui/project-form';
import { ExpenseForm } from '@features/create-expense/ui/expense-form';
import { IncomeForm } from '@features/create-income/ui/income-form';

const META: Record<
  CreateModalKind,
  { title: string; subtitle?: string; width: number }
> = {
  project: {
    title: 'Новый объект',
    subtitle: 'Заполните карточку объекта — её можно будет дополнить позже',
    width: 720,
  },
  expense: {
    title: 'Новый расход',
    subtitle: 'Зафиксируйте расход в кассе или по объекту',
    width: 560,
  },
  income: {
    title: 'Новое поступление',
    subtitle: 'Поступление от клиента или зачёт аванса',
    width: 560,
  },
};

/**
 * Single global modal that hosts every "create entity" form. Tracks the
 * active form's dirty state so the FormModal can prompt before closing
 * with unsaved input.
 */
export function CreateModalsHost() {
  const kind = useCreateModalStore((s) => s.kind);
  const close = useCreateModalStore((s) => s.close);
  const [dirty, setDirty] = useState(false);

  // Reset dirty when modal closes so a stale value can't gate the next open.
  useEffect(() => {
    if (kind === null) setDirty(false);
  }, [kind]);

  if (!kind) return null;
  const { title, subtitle, width } = META[kind];

  return (
    <FormModal
      title={title}
      subtitle={subtitle}
      open={!!kind}
      onClose={close}
      width={width}
      dirty={dirty}
    >
      {kind === 'project' && <ProjectForm onDone={close} onDirtyChange={setDirty} />}
      {kind === 'expense' && <ExpenseForm onDone={close} onDirtyChange={setDirty} />}
      {kind === 'income' && <IncomeForm onDone={close} onDirtyChange={setDirty} />}
    </FormModal>
  );
}
