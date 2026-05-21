'use client';

import { Modal } from 'antd';
import { ReactNode, useId, useMemo } from 'react';
import { useModalNudgeOnBackdrop } from '@shared/hooks/use-modal-nudge';

interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
  open: boolean;
  onClose: () => void;
  /** Header action buttons pinned to the right. */
  extra?: ReactNode;
  /** Desktop width in pixels. */
  width?: number;
  footer?: ReactNode;
  /**
   * If true, mask-click and Escape are blocked. The backdrop responds
   * with a subtle nudge — useful for detail modals that wrap a long
   * editable form (stock count, receive PO).
   */
  locked?: boolean;
  children: ReactNode;
}

/**
 * Wide read-mostly modal for entity details. 960px default — comfortable
 * for tables, galleries, and side-by-side description grids. Mobile
 * collapses to fullscreen via CSS.
 */
export function DetailModal({
  title,
  subtitle,
  open,
  onClose,
  extra,
  width = 960,
  footer,
  locked = false,
  children,
}: Props) {
  const rawId = useId();
  const wrapClassName = useMemo(
    () => `dm-wrap-${rawId.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
    [rawId],
  );

  useModalNudgeOnBackdrop({
    open,
    enabled: locked,
    wrapClassName,
  });

  return (
    <Modal
      title={
        <div className="modal-head modal-head--with-extra">
          <div className="modal-head__text">
            <div className="modal-head__title-row">
              <span className="modal-head__title">{title}</span>
            </div>
            {subtitle && <div className="modal-head__subtitle">{subtitle}</div>}
          </div>
          {extra && <div className="modal-head__extra">{extra}</div>}
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={width}
      destroyOnHidden
      maskClosable={!locked}
      keyboard={!locked}
      centered
      rootClassName="detail-modal"
      wrapClassName={wrapClassName}
      styles={{ body: { padding: 0 } }}
    >
      <div className="modal-body">
        <div className="modal-body__scroll modal-body__scroll--detail">{children}</div>
        {footer && <div className="modal-body__footer">{footer}</div>}
      </div>
    </Modal>
  );
}
