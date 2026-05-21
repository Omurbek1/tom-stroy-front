'use client';

import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useCallback, useState } from 'react';
import { FormModal } from '@shared/ui/form-modal';
import { ProjectForm } from './project-form';

/**
 * Page-local trigger to open the "create project" form. The form body
 * lives in `<ProjectForm>` so the same code powers both this button and
 * the global FAB-driven `<CreateModalsHost>`.
 */
export function CreateProjectButton() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
        Новый объект
      </Button>
      <FormModal title="Новый объект" open={open} onClose={close} width={520}>
        <ProjectForm onDone={close} />
      </FormModal>
    </>
  );
}
