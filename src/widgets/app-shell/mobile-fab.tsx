'use client';

import { PlusOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { memo, useMemo } from 'react';
import { useCreateModalStore } from '@app-init/store/create-modal-store';

/**
 * Context-aware floating action button (mobile only). The menu changes
 * depending on the current route, and items either:
 *   - open a global create-modal via `useCreateModalStore` (preferred —
 *     no page navigation, drawer slides over the current screen), or
 *   - fall back to `router.push` to the right page when no modal exists
 *     for that entity yet (stub create flow).
 *
 * Hidden on /login via AppShell mount gating.
 */
function MobileFabImpl() {
  const router = useRouter();
  const pathname = usePathname() ?? '/';
  const openModal = useCreateModalStore((s) => s.open);

  const items = useMemo(() => {
    if (pathname.startsWith('/warehouse')) {
      return [
        { key: 'expense', label: 'Расход', onClick: () => openModal('expense') },
        { key: 'item', label: 'Новый товар', onClick: () => router.push('/warehouse') },
      ];
    }
    if (pathname.startsWith('/finance')) {
      return [
        { key: 'income', label: 'Поступление', onClick: () => openModal('income') },
        { key: 'expense', label: 'Расход', onClick: () => openModal('expense') },
      ];
    }
    if (pathname.startsWith('/payroll')) {
      return [
        { key: 'expense', label: 'Расход', onClick: () => openModal('expense') },
        { key: 'close', label: 'Закрыть период', onClick: () => router.push('/payroll') },
      ];
    }
    if (pathname.startsWith('/vehicles')) {
      return [
        { key: 'expense', label: 'Расход', onClick: () => openModal('expense') },
        { key: 'vehicle', label: 'Техника', onClick: () => router.push('/vehicles') },
      ];
    }
    if (pathname.startsWith('/employees')) {
      return [
        { key: 'employee', label: 'Сотрудник', onClick: () => router.push('/employees') },
      ];
    }
    if (pathname.startsWith('/brigades')) {
      return [{ key: 'brigade', label: 'Бригада', onClick: () => router.push('/brigades') }];
    }
    return [
      { key: 'project', label: 'Объект', onClick: () => openModal('project') },
      { key: 'income', label: 'Поступление', onClick: () => openModal('income') },
      { key: 'expense', label: 'Расход', onClick: () => openModal('expense') },
    ];
  }, [pathname, router, openModal]);

  if (pathname.startsWith('/login')) return null;

  return (
    <Dropdown
      trigger={['click']}
      placement="topRight"
      menu={{
        items: items.map((it) => ({
          key: it.key,
          label: it.label,
          onClick: it.onClick,
        })),
      }}
    >
      <button type="button" className="mob-fab" aria-label="Создать">
        <PlusOutlined />
      </button>
    </Dropdown>
  );
}

export const MobileFab = memo(MobileFabImpl);
