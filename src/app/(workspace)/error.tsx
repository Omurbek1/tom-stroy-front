'use client';

import { Button, Result } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useEffect } from 'react';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Route-level error boundary. Catches render/effect errors inside any
 * workspace page. The shell (sidebar/topbar) keeps rendering — only the
 * content area shows this state.
 */
export default function WorkspaceError({ error, reset }: Props) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[workspace] route error:', error);
  }, [error]);

  return (
    <div className="page-container">
      <Result
        status="error"
        title="Что-то пошло не так"
        subTitle={error.message || 'Неизвестная ошибка при загрузке страницы'}
        extra={
          <Button type="primary" icon={<ReloadOutlined />} onClick={reset}>
            Повторить
          </Button>
        }
      />
    </div>
  );
}
