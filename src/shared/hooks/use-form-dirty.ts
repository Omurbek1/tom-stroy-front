'use client';

import type { FormInstance } from 'antd';
import { useEffect, useState } from 'react';

/**
 * Tracks whether an AntD `Form.useForm()` instance has unsaved changes.
 * Use to enable "close without saving?" guards on modals/drawers.
 *
 *   const [form] = Form.useForm();
 *   const dirty = useFormDirty(form);
 *   <FormModal onBeforeClose={() => !dirty || confirm('Discard?')} … />
 *
 * Subscribes to AntD's internal store; updates are batched and don't
 * cause render thrash because `setState(true)` is a no-op when already
 * `true`.
 */
export function useFormDirty(form: FormInstance | null | undefined): boolean {
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!form) return;
    setDirty(form.isFieldsTouched());

    const internal = (
      form as unknown as {
        getInternalHooks?: (key: string) => { registerWatch?: (cb: () => void) => () => void };
      }
    ).getInternalHooks?.('RC_FORM_INTERNAL_HOOKS');

    if (!internal?.registerWatch) return;
    const unsubscribe = internal.registerWatch(() => {
      setDirty(form.isFieldsTouched());
    });
    return unsubscribe;
  }, [form]);

  return dirty;
}
