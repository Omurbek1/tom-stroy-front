import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  employeeId?: string | null;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  /** Epoch ms when the access token expires (decoded from JWT `exp`). */
  accessExpiresAt?: number;
}

interface AuthStore {
  user: CurrentUser | null;
  tokens: Tokens | null;
  /**
   * `true` after `persist` has read localStorage on the client. Until then
   * `user`/`tokens` may be the SSR-safe defaults (null) — guards must wait
   * for this flag before redirecting to /login, otherwise a hard reload
   * bounces an authenticated user out.
   */
  hasHydrated: boolean;
  /** Kept for backwards-compat with AuthProvider; persist auto-hydrates. */
  hydrate: () => void;
  setSession: (user: CurrentUser, tokens: Tokens) => void;
  /** Used by HTTP refresh interceptor — updates tokens without touching user. */
  setTokens: (tokens: Tokens) => void;
  clear: () => void;
}

const STORAGE_KEY = 'tomstroy.auth';

/**
 * Decode JWT and read `exp` (seconds since epoch). Returns `undefined`
 * if the token is malformed — caller should treat that as "no expiry
 * info available" and fall back to reactive 401-then-refresh.
 *
 * Pure base64url decode — no signature verification (that's the server's job).
 */
function readJwtExpiryMs(token: string): number | undefined {
  try {
    const payload = token.split('.')[1];
    if (!payload) return undefined;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '==='.slice((base64.length + 3) % 4);
    const json =
      typeof atob === 'function'
        ? atob(padded)
        : Buffer.from(padded, 'base64').toString('binary');
    const decoded = JSON.parse(json) as { exp?: number };
    return typeof decoded.exp === 'number' ? decoded.exp * 1000 : undefined;
  } catch {
    return undefined;
  }
}

/** Enrich Tokens with `accessExpiresAt` if not already present. */
function withExpiry(tokens: Tokens): Tokens {
  if (tokens.accessExpiresAt) return tokens;
  return { ...tokens, accessExpiresAt: readJwtExpiryMs(tokens.accessToken) };
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      hasHydrated: false,
      hydrate: () => {
        // No-op — `persist` middleware rehydrates synchronously on first
        // store access. Kept as a stable reference so old call sites compile.
      },
      setSession: (user, tokens) => set({ user, tokens: withExpiry(tokens) }),
      setTokens: (tokens) => set({ tokens: withExpiry(tokens) }),
      clear: () => set({ user: null, tokens: null }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Only persist the fields that matter — never serialize functions or
      // derived values. Bumping `version` invalidates old shapes on upgrade.
      version: 2,
      partialize: (state) => ({ user: state.user, tokens: state.tokens }),
      migrate: (persisted, version) => {
        // v1 → v2: backfill accessExpiresAt from JWT if missing.
        const p = persisted as Partial<AuthStore> | null;
        if (!p?.tokens) return p as AuthStore;
        if (version < 2 && !p.tokens.accessExpiresAt) {
          return {
            ...p,
            tokens: withExpiry(p.tokens),
          } as AuthStore;
        }
        return p as AuthStore;
      },
      onRehydrateStorage: () => (state) => {
        // Fires after persist reads localStorage on the client. Without this
        // flip, guards see `user: null` for one tick and redirect to /login.
        if (state) state.hasHydrated = true;
        else useAuthStore.setState({ hasHydrated: true });
      },
    },
  ),
);

/* ============================================================
   Cross-tab sync — when another tab logs in/out, sync this one.
   `persist` already writes to localStorage, but doesn't listen
   for OTHER tabs' writes. The `storage` event covers that.
   ============================================================ */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY) return;
    if (!e.newValue) {
      // Logged out in another tab.
      useAuthStore.setState({ user: null, tokens: null });
      return;
    }
    try {
      const parsed = JSON.parse(e.newValue) as {
        state?: { user?: CurrentUser | null; tokens?: Tokens | null };
      };
      const next = parsed?.state;
      if (!next) return;
      useAuthStore.setState({
        user: next.user ?? null,
        tokens: next.tokens ?? null,
      });
    } catch {
      // Ignore — another tab wrote garbage; our state stays valid.
    }
  });
}

/* ============================================================
   Module-level accessors for non-React code (http interceptor,
   socket auth handshake). Avoid calling useAuthStore.getState()
   directly from a hot path — these wrappers document intent.
   ============================================================ */
export const authSelectors = {
  accessToken: (): string | undefined => useAuthStore.getState().tokens?.accessToken,
  refreshToken: (): string | undefined => useAuthStore.getState().tokens?.refreshToken,
  /** True if access token expires within `ms` from now (or already did). */
  isAccessExpiringWithin: (ms: number): boolean => {
    const exp = useAuthStore.getState().tokens?.accessExpiresAt;
    if (!exp) return false;
    return Date.now() + ms >= exp;
  },
};
