'use client';

import { Modal } from 'antd';
import { modal as staticModal } from '@shared/lib/antd-static';
import {
  KeyboardEvent,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
} from 'react';
import { useModalNudgeOnBackdrop } from '@shared/hooks/use-modal-nudge';

interface Props {
  title: ReactNode;
  /** Secondary line under the title. */
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
   *   - a `•` accent dot appears next to the title
   *   - clicking on the backdrop nudges the modal + vibrates on mobile
   *   - tab close / reload triggers the browser's "Leave site?" prompt
   */
  dirty?: boolean;
  /**
   * Optional submit handler. When provided, ⌘/Ctrl+Enter anywhere inside
   * the modal calls it — saves a reach to the bottom Submit button.
   */
  onSubmit?: () => void;
  children: ReactNode;
}

/**
 * Project-wide form modal. Sticky head / scrollable body / sticky footer.
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
  onSubmit,
  children,
}: Props) {
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

  useEffect(() => {
    if (!open || !dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [open, dirty]);

  // Per-instance wrap class so multiple open modals don't fight each other.
  // useId is SSR-safe and collision-free; colons aren't valid in CSS class
  // selectors via querySelector, so sanitize.
  const rawId = useId();
  const wrapClassName = useMemo(
    () => `fm-wrap-${rawId.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
    [rawId],
  );

  useModalNudgeOnBackdrop({
    open,
    enabled: dirty,
    wrapClassName,
  });

  const footerRef = useRef<HTMLDivElement | null>(null);
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && onSubmit) {
        e.preventDefault();
        const footer = footerRef.current;
        if (footer) {
          footer.classList.remove('is-submit-pulsing');
          void footer.offsetWidth; // force reflow so the class re-triggers anim
          footer.classList.add('is-submit-pulsing');
          if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
          pulseTimerRef.current = setTimeout(() => {
            footer.classList.remove('is-submit-pulsing');
          }, 360);
        }
        onSubmit();
      }
    },
    [onSubmit],
  );

  useEffect(() => {
    return () => {
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    };
  }, []);

  const modKey = useMemo(() => {
    if (typeof navigator === 'undefined') return '⌘';
    return /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent)
      ? '⌘'
      : 'Ctrl';
  }, []);

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
      wrapClassName={wrapClassName}
      styles={{ body: { padding: 0 } }}
    >
      <div className="modal-body" onKeyDown={handleKeyDown}>
        <div className="modal-body__scroll">{children}</div>
        {footer && (
          <div className="modal-body__footer" ref={footerRef}>
            {onSubmit && (
              <span
                className="modal-body__kbd-hint"
                aria-hidden="true"
                title="Сохранить"
              >
                <span className="modal-body__kbd">{modKey}</span>
                <span className="modal-body__kbd">↵</span>
              </span>
            )}
            {footer}
          </div>
        )}
      </div>
    </Modal>
  );
}
