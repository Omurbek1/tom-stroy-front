'use client';

import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useCallback, useState } from 'react';
import { FormModal } from '@shared/ui/form-modal';
import { ExpenseForm } from './expense-form';
import type { Expense } from '@entities/expense/types';

interface Props {
  projectId?: string;
  /** Controlled edit mode — parent passes expense + open state. */
  expense?: Expense | null;
  open?: boolean;
  onClose?: () => void;
  /** Hide the button (use when parent triggers the modal externally). */
  hideTrigger?: boolean;
}

export function CreateExpenseButton({
  projectId,
  expense,
  open: openProp,
  onClose,
  hideTrigger,
}: Props = {}) {
  const [openState, setOpenState] = useState(false);
  const [dirty, setDirty] = useState(false);
  const controlled = openProp !== undefined;
  const open = controlled ? !!openProp : openState;
  const close = useCallback(() => {
    setDirty(false);
    if (controlled) onClose?.();
    else setOpenState(false);
  }, [controlled, onClose]);

  const isEdit = Boolean(expense);

  return (
    <>
      {!hideTrigger && !controlled && (
        <Button icon={<PlusOutlined />} onClick={() => setOpenState(true)}>
          Расход
        </Button>
      )}
      <FormModal
        title={isEdit ? 'Редактирование расхода' : 'Новый расход'}
        subtitle={
          isEdit
            ? 'Изменения попадут в P&L и аналитику немедленно'
            : 'Расход уменьшает прибыль объекта либо относится на компанию'
        }
        open={open}
        onClose={close}
        width={720}
        dirty={dirty}
      >
        <ExpenseForm
          projectId={projectId}
          expense={expense}
          onDone={close}
          onDirtyChange={setDirty}
        />
      </FormModal>
    </>
  );
}
