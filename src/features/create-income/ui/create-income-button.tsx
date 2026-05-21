'use client';

import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useCallback, useState } from 'react';
import { FormModal } from '@shared/ui/form-modal';
import { IncomeForm } from './income-form';

export function CreateIncomeButton({ projectId }: { projectId?: string } = {}) {
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const close = useCallback(() => {
    setOpen(false);
    setDirty(false);
  }, []);

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
        Поступление
      </Button>
      <FormModal
        title="Новое поступление от клиента"
        open={open}
        onClose={close}
        width={460}
        dirty={dirty}
      >
        <IncomeForm projectId={projectId} onDone={close} onDirtyChange={setDirty} />
      </FormModal>
    </>
  );
}
