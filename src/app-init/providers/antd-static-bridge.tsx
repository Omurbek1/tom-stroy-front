'use client';

import { App } from 'antd';
import { setAntdStatic } from '@shared/lib/antd-static';

export function AntdStaticBridge() {
  const { message, notification, modal } = App.useApp();
  setAntdStatic({ message, notification, modal });
  return null;
}
