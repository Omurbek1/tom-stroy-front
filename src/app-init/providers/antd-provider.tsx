'use client';

import '@ant-design/v5-patch-for-react-19';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { App, ConfigProvider, theme } from 'antd';
import ru_RU from 'antd/locale/ru_RU';
import { ReactNode, useMemo } from 'react';
import { useThemeStore } from '../store/theme-store';
import { AntdStaticBridge } from './antd-static-bridge';

const FONT_FAMILY =
  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const LIGHT_TOKEN = {
  colorPrimary: '#2563eb',
  colorSuccess: '#15803d',
  colorWarning: '#b45309',
  colorError: '#b91c1c',
  colorInfo: '#0284c7',
  colorBgBase: '#f5f7fa',
  colorBgContainer: '#ffffff',
  colorBgElevated: '#ffffff',
  colorBgLayout: '#f5f7fa',
  colorBorder: '#e5e7eb',
  colorBorderSecondary: '#eef2f7',
  colorText: '#111827',
  colorTextSecondary: '#64748b',
  colorTextTertiary: '#94a3b8',
  colorFillSecondary: '#f8fafc',
};

const DARK_TOKEN = {
  colorPrimary: '#60a5fa',
  colorSuccess: '#4ade80',
  colorWarning: '#fbbf24',
  colorError: '#f87171',
  colorInfo: '#38bdf8',
  colorBgBase: '#0f172a',
  colorBgContainer: '#111827',
  colorBgElevated: '#1e293b',
  colorBgLayout: '#0f172a',
  colorBorder: '#243244',
  colorBorderSecondary: '#1e293b',
  colorText: '#f8fafc',
  colorTextSecondary: '#94a3b8',
  colorTextTertiary: '#64748b',
  colorFillSecondary: '#172033',
};

const COMMON_TOKEN = {
  borderRadius: 10,
  borderRadiusLG: 12,
  borderRadiusSM: 6,
  fontFamily: FONT_FAMILY,
  fontSize: 14,
  fontSizeSM: 12,
  fontSizeLG: 16,
  fontSizeHeading1: 30,
  fontSizeHeading2: 24,
  fontSizeHeading3: 20,
  fontSizeHeading4: 18,
  fontSizeHeading5: 16,
  lineHeight: 1.43,
  lineHeightSM: 1.33,
  lineHeightLG: 1.5,
  controlHeight: 36,
  controlHeightSM: 28,
  controlHeightLG: 40,
  motionDurationMid: '0.15s',
} as const;

const COMPONENTS = {
  Card: {
    borderRadiusLG: 12,
    paddingLG: 16,
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
    horizontalItemPadding: '8px 14px',
    titleFontSize: 14,
  },
  Drawer: {
    paddingLG: 16,
  },
  Modal: {
    borderRadiusLG: 16,
    paddingContentHorizontalLG: 24,
    titleFontSize: 17,
    titleLineHeight: 22 / 17,
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
      algorithm: isDark
        ? [theme.darkAlgorithm, theme.compactAlgorithm]
        : [theme.defaultAlgorithm, theme.compactAlgorithm],
      token: {
        ...COMMON_TOKEN,
        ...(isDark ? DARK_TOKEN : LIGHT_TOKEN),
        // Floating UI base z-index. Must be strictly above any sticky
        // toolbar / page header (`--z-sticky-header: 30`) so dropdowns
        // never disappear under a sticky layer. 1050 matches the global
        // CSS scale (`--z-dropdown`) and AntD default.
        zIndexPopupBase: 1050,
      },
      components: {
        ...COMPONENTS,
        Card: {
          ...COMPONENTS.Card,
          colorBgContainer: isDark ? DARK_TOKEN.colorBgContainer : LIGHT_TOKEN.colorBgContainer,
          colorBorderSecondary: isDark ? DARK_TOKEN.colorBorder : LIGHT_TOKEN.colorBorder,
        },
        Table: {
          headerBg: isDark ? '#172033' : '#f8fafc',
          headerColor: isDark ? '#94a3b8' : '#64748b',
          rowHoverBg: isDark ? '#172033' : '#f8fafc',
          borderColor: isDark ? '#243244' : '#e5e7eb',
          cellPaddingBlockSM: 8,
          cellPaddingInlineSM: 12,
          fontSize: 13,
          fontSizeSM: 13,
        },
        Layout: {
          headerBg: isDark ? DARK_TOKEN.colorBgContainer : LIGHT_TOKEN.colorBgContainer,
          bodyBg: isDark ? DARK_TOKEN.colorBgLayout : LIGHT_TOKEN.colorBgLayout,
        },
        Menu: {
          itemHeight: 36,
        },
      },
    };
  }, [mode]);

  // Render every popup at the document body — escapes any sticky /
  // backdrop-filter / transform parent that would otherwise clip the
  // dropdown or pull it into a lower stacking context.
  const popupContainer = () =>
    typeof document === 'undefined' ? (null as unknown as HTMLElement) : document.body;

  return (
    <AntdRegistry>
      <ConfigProvider
        locale={ru_RU}
        theme={themeConfig}
        getPopupContainer={popupContainer}
      >
        <App>
          <AntdStaticBridge />
          {children}
        </App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
