'use client';

import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useCallback, useState } from 'react';
import { FormModal } from '@shared/ui/form-modal';
import { IncomeForm } from './income-form';
import type { Income } from '@entities/income/types';

interface Props {
  projectId?: string;
  /** Controlled edit mode. */
  income?: Income | null;
  open?: boolean;
  onClose?: () => void;
  hideTrigger?: boolean;
}

export function CreateIncomeButton({
  projectId,
  income,
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

  const isEdit = Boolean(income);

  return (
    <>
      {!hideTrigger && !controlled && (
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpenState(true)}>
          Поступление
        </Button>
      )}
      <FormModal
        title={isEdit ? 'Редактирование поступления' : 'Новое поступление от клиента'}
        subtitle={
          isEdit
            ? 'Изменения попадут в P&L и аналитику немедленно'
            : 'Деньги, полученные от заказчика — авансы, промежуточные и финальные платежи'
        }
        open={open}
        onClose={close}
        width={720}
        dirty={dirty}
      >
        <IncomeForm
          projectId={projectId}
          income={income}
          onDone={close}
          onDirtyChange={setDirty}
        />
      </FormModal>
    </>
  );
}
