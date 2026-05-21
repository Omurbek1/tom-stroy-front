import type { MessageInstance } from 'antd/es/message/interface';
import type { NotificationInstance } from 'antd/es/notification/interface';
import type { HookAPI as ModalHookAPI } from 'antd/es/modal/useModal';

type AntdStatic = {
  message: MessageInstance;
  notification: NotificationInstance;
  modal: ModalHookAPI;
};

let instance: AntdStatic | null = null;

export function setAntdStatic(value: AntdStatic) {
  instance = value;
}

function get(): AntdStatic {
  if (!instance) {
    throw new Error(
      'antd static API used before <AntdProvider> mounted. Make sure the call site runs inside the React tree.',
    );
  }
  return instance;
}

export const message: MessageInstance = new Proxy({} as MessageInstance, {
  get: (_t, prop) => Reflect.get(get().message, prop),
});

export const notification: NotificationInstance = new Proxy({} as NotificationInstance, {
  get: (_t, prop) => Reflect.get(get().notification, prop),
});

export const modal: ModalHookAPI = new Proxy({} as ModalHookAPI, {
  get: (_t, prop) => Reflect.get(get().modal, prop),
});
