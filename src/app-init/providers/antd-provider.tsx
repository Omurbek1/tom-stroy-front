'use client';

import '@ant-design/v5-patch-for-react-19';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { App, ConfigProvider, theme } from 'antd';
import { ReactNode } from 'react';
import { useThemeStore } from '../store/theme-store';
import { AntdStaticBridge } from './antd-static-bridge';

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
        <App>
          <AntdStaticBridge />
          {children}
        </App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
