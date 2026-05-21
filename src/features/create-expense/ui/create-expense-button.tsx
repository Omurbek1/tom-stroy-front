'use client';

import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useCallback, useState } from 'react';
import { FormModal } from '@shared/ui/form-modal';
import { ExpenseForm } from './expense-form';

export function CreateExpenseButton({ projectId }: { projectId?: string } = {}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <Button icon={<PlusOutlined />} onClick={() => setOpen(true)}>
        Расход
      </Button>
      <FormModal title="Новый расход" open={open} onClose={close} width={460}>
        <ExpenseForm projectId={projectId} onDone={close} />
      </FormModal>
    </>
  );
}
