import { create } from 'zustand';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'OWNER'
  | 'DIRECTOR'
  | 'ACCOUNTANT'
  | 'FOREMAN'
  | 'WAREHOUSE'
  | 'MANAGER';

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthStore {
  user: CurrentUser | null;
  tokens: Tokens | null;
  hydrate: () => void;
  setSession: (user: CurrentUser, tokens: Tokens) => void;
  clear: () => void;
}

const STORAGE_KEY = 'tomstroy.auth';

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  tokens: null,
  hydrate: () => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { user: CurrentUser; tokens: Tokens };
      set({ user: parsed.user, tokens: parsed.tokens });
    } catch {
      // ignore corrupted state
    }
  },
  setSession: (user, tokens) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, tokens }));
    }
    set({ user, tokens });
  },
  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({ user: null, tokens: null });
  },
}));
