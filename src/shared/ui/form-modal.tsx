'use client';

import { Modal } from 'antd';
import { modal as staticModal } from '@shared/lib/antd-static';
import { ReactNode, useCallback, useEffect } from 'react';

interface Props {
  title: ReactNode;
  /** Secondary line under the title — context, hint, route name. */
  subtitle?: ReactNode;
  open: boolean;
  onClose: () => void;
  /** Desktop width in pixels. Mobile is always edge-to-edge. */
  width?: number;
  /** Sticky footer slot — primary action belongs here. */
  footer?: ReactNode;
  /** Tag/badge rendered next to the title. */
  badge?: ReactNode;
  /**
   * If true:
   *   - close requests run through a discard-confirm dialog
   *   - mask-click and Escape are disabled
   *   - a `•` accent dot appears next to the title (IDE-tab style)
   *   - tab close / reload triggers the browser's "Leave site?" prompt
   */
  dirty?: boolean;
  children: ReactNode;
}

/**
 * Project-wide form modal. Three-row layout:
 *
 *   ┌────────────────────────────────────────────┐
 *   │ • Title           [badge]            ✕    │  sticky head
 *   │ subtitle                                   │
 *   ├────────────────────────────────────────────┤
 *   │ scrollable body                            │
 *   ├────────────────────────────────────────────┤
 *   │ sticky footer (optional)                   │
 *   └────────────────────────────────────────────┘
 */
export function FormModal({
  title,
  subtitle,
  open,
  onClose,
  width = 640,
  footer,
  badge,
  dirty = false,
  children,
}: Props) {
  // Confirm-on-close while the form has unsaved input.
  const requestClose = useCallback(() => {
    if (!dirty) {
      onClose();
      return;
    }
    staticModal.confirm({
      title: 'Закрыть без сохранения?',
      content: 'Введённые данные будут потеряны.',
      okText: 'Закрыть',
      okButtonProps: { danger: true },
      cancelText: 'Продолжить',
      centered: true,
      onOk: () => onClose(),
    });
  }, [dirty, onClose]);

  // Browser-level guard: prevent accidental tab close / reload / link
  // navigation while the modal is open and dirty. The `returnValue`
  // string is ignored by modern browsers (they show a generic message),
  // but setting it is what actually triggers the prompt.
  useEffect(() => {
    if (!open || !dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [open, dirty]);

  return (
    <Modal
      title={
        <div className="modal-head">
          <div className="modal-head__text">
            <div className="modal-head__title-row">
              {dirty && (
                <span
                  className="modal-head__dirty-dot"
                  aria-label="Есть несохранённые изменения"
                  title="Есть несохранённые изменения"
                />
              )}
              <span className="modal-head__title">{title}</span>
              {badge && <span className="modal-head__badge">{badge}</span>}
            </div>
            {subtitle && <div className="modal-head__subtitle">{subtitle}</div>}
          </div>
        </div>
      }
      open={open}
      onCancel={requestClose}
      footer={null}
      width={width}
      destroyOnHidden
      maskClosable={!dirty}
      keyboard={!dirty}
      centered
      rootClassName="form-modal"
      styles={{ body: { padding: 0 } }}
    >
      <div className="modal-body">
        <div className="modal-body__scroll">{children}</div>
        {footer && <div className="modal-body__footer">{footer}</div>}
      </div>
    </Modal>
  );
}
