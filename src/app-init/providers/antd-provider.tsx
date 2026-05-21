'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, theme } from 'antd';
import { ReactNode } from 'react';
import { useThemeStore } from '../store/theme-store';

export function AntdProvider({ children }: { children: ReactNode }) {
  const mode = useThemeStore((s) => s.mode);
  const algorithm = mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm;

  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          algorithm,
          token: {
            colorPrimary: '#1677ff',
            borderRadius: 8,
            fontFamily:
              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          },
          components: {
            Table: { headerBg: mode === 'dark' ? '#141414' : '#fafafa' },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </AntdRegistry>
  );
}
