'use client';

import type { FormInstance } from 'antd';
import { useFormDirty } from '@shared/hooks/use-form-dirty';
import { useEffect } from 'react';

interface Props {
  form: FormInstance | null | undefined;
  onChange: (dirty: boolean) => void;
}

/**
 * Render-less component that watches an AntD form for dirty state and
 * pipes it to a callback. Drop inside any form to enable the parent's
 * `<FormModal dirty>` close-confirm without prop-drilling forms.
 *
 *   <Form form={form}>
 *     <FormDirtyProbe form={form} onChange={setDirty} />
 *     …fields…
 *   </Form>
 */
export function FormDirtyProbe({ form, onChange }: Props) {
  const dirty = useFormDirty(form);
  useEffect(() => {
    onChange(dirty);
  }, [dirty, onChange]);
  return null;
}
