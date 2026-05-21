'use client';

import '@ant-design/v5-patch-for-react-19';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { App, ConfigProvider, theme } from 'antd';
import ru_RU from 'antd/locale/ru_RU';
import { ReactNode, useMemo } from 'react';
import { useThemeStore } from '../store/theme-store';
import { AntdStaticBridge } from './antd-static-bridge';

/**
 * AntD theme tokens. Mirror the CSS variables in globals.css so that
 * non-AntD elements (sidebar, headers, page chrome) and AntD components
 * share the same look.
 */
const COMMON_TOKEN = {
  colorPrimary: '#1677ff',
  colorSuccess: '#52c41a',
  colorWarning: '#d48806',
  colorError: '#cf1322',
  colorInfo: '#1677ff',
  borderRadius: 10,
  borderRadiusLG: 12,
  borderRadiusSM: 6,
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: 14,
  controlHeight: 36,
  motionDurationMid: '0.15s',
} as const;

const COMPONENTS = {
  Card: {
    borderRadiusLG: 12,
    paddingLG: 20,
  },
  Button: {
    controlHeight: 36,
    paddingInline: 16,
    fontWeight: 500,
  },
  Input: {
    controlHeight: 36,
  },
  Select: {
    controlHeight: 36,
  },
  DatePicker: {
    controlHeight: 36,
  },
  Tabs: {
    horizontalItemPadding: '10px 16px',
    titleFontSize: 14,
  },
  Drawer: {
    paddingLG: 20,
  },
  Tag: {
    borderRadiusSM: 6,
  },
} as const;

export function AntdProvider({ children }: { children: ReactNode }) {
  const mode = useThemeStore((s) => s.mode);

  const themeConfig = useMemo(() => {
    const isDark = mode === 'dark';
    return {
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: COMMON_TOKEN,
      components: {
        ...COMPONENTS,
        Table: {
          headerBg: isDark ? '#141414' : '#fafafa',
          headerColor: isDark ? '#cfcfcf' : '#374151',
          rowHoverBg: isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb',
          borderColor: isDark ? '#262626' : '#eef0f2',
        },
        Layout: {
          headerBg: isDark ? '#141414' : '#ffffff',
          bodyBg: isDark ? '#0b0d10' : '#f4f6f8',
        },
        Menu: {
          itemHeight: 36,
        },
      },
    };
  }, [mode]);

  return (
    <AntdRegistry>
      <ConfigProvider locale={ru_RU} theme={themeConfig}>
        <App>
          <AntdStaticBridge />
          {children}
        </App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
