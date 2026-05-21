'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Tactile "nudge" for AntD modals — a sub-3px horizontal shake when the
 * user clicks the backdrop and the modal won't close (typical for dirty
 * forms). macOS-style cue: "this can't be dismissed that way".
 *
 *   const wrapClass = useRef(`m-${Math.random()...}`);
 *   useModalNudgeOnBackdrop({ open, enabled: dirty, wrapClassName: wrapClass.current });
 *   <Modal wrapClassName={wrapClass.current} ... />
 *
 * Pure DOM — no React state, no re-renders. Vibrates briefly on mobile
 * via the Vibration API where supported.
 */
export function useModalNudgeOnBackdrop({
  open,
  enabled,
  wrapClassName,
}: {
  open: boolean;
  enabled: boolean;
  wrapClassName: string;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trigger = useCallback((content: Element | null) => {
    if (!content) return;
    content.classList.remove('is-nudging');
    // Force reflow so removeClass commits before addClass re-triggers anim.
    void (content as HTMLElement).offsetWidth;
    content.classList.add('is-nudging');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      content.classList.remove('is-nudging');
    }, 300);

    // Haptic feedback on supported devices (Android Chrome, etc.).
    // Skip when user has reduced-motion preference set.
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.vibrate === 'function' &&
      !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      try {
        navigator.vibrate(15);
      } catch {
        /* no-op — older browsers throw on certain patterns */
      }
    }
  }, []);

  useEffect(() => {
    if (!open || !enabled) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const wrap = target.closest(`.${wrapClassName}`);
      // Click landed on the wrap itself = backdrop area (clicks inside
      // the content bubble up with target = content, not wrap).
      if (wrap && target === wrap) {
        trigger(wrap.querySelector('.ant-modal-content'));
      }
    };
    document.addEventListener('mousedown', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open, enabled, wrapClassName, trigger]);
}
