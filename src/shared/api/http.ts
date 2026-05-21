import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authSelectors, useAuthStore } from '@app-init/store/auth-store';

export const http = axios.create({
  baseURL: '/api',
  timeout: 15_000,
});

/**
 * Proactive refresh threshold — if the access token expires within
 * this window when a request fires, refresh BEFORE sending so the
 * server never sees a 401 on the user's hot path. Cheaper than
 * paying the round-trip + retry cost.
 */
const PROACTIVE_REFRESH_MS = 30_000;

/* ------------------------------------------------------------------
   Single-flight refresh — one in-flight refresh shared by N callers.
   Holds onto the in-flight Promise until it RESOLVES, then clears.
   Previous implementation cleared the slot mid-await, so a third
   concurrent 401 could start a duplicate refresh.
   ------------------------------------------------------------------ */
let refreshInFlight: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refreshToken = authSelectors.refreshToken();
  if (!refreshToken) return null;
  try {
    // Use bare axios — never go through `http` here, or a failed refresh
    // would recurse into the response interceptor and loop.
    const res = await axios.post<{
      data: { tokens: { accessToken: string; refreshToken: string } };
    }>('/api/auth/refresh', { refreshToken }, { timeout: 10_000 });
    const tokens = res.data.data.tokens;
    useAuthStore.getState().setTokens(tokens);
    return tokens.accessToken;
  } catch {
    useAuthStore.getState().clear();
    if (typeof window !== 'undefined') {
      // Avoid a redirect loop if we're already on /login.
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return null;
  }
}

function refreshSingleFlight(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

/* ------------------------------------------------------------------
   Request interceptor — attach the current access token. If we know
   the token is about to expire, refresh first so the request never
   races a 401.
   ------------------------------------------------------------------ */
http.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // Skip auth handling for /auth/* (login, refresh) — those carry their
  // own credentials and must not block on a refresh of their own creating.
  const url = config.url ?? '';
  const isAuthRoute = url.startsWith('/auth/') || url.includes('/auth/');

  let accessToken = authSelectors.accessToken();

  if (
    accessToken &&
    !isAuthRoute &&
    authSelectors.isAccessExpiringWithin(PROACTIVE_REFRESH_MS)
  ) {
    const refreshed = await refreshSingleFlight();
    if (refreshed) accessToken = refreshed;
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/* ------------------------------------------------------------------
   Response interceptor — on 401, do ONE retry after a single-flight
   refresh. If refresh fails, the user is bounced to /login and we
   reject the original error.
   ------------------------------------------------------------------ */
http.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined;
    const url = original?.url ?? '';
    const isAuthRoute = url.startsWith('/auth/') || url.includes('/auth/');

    if (
      error.response?.status === 401 &&
      original &&
      !original._retried &&
      !isAuthRoute
    ) {
      original._retried = true;
      const newToken = await refreshSingleFlight();
      if (newToken) {
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>).Authorization =
          `Bearer ${newToken}`;
        return http.request(original);
      }
    }
    return Promise.reject(error);
  },
);
