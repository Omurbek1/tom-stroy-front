import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const STORAGE_KEY = 'tomstroy.auth';

interface StoredSession {
  user: unknown;
  tokens: { accessToken: string; refreshToken: string };
}

function readSession(): StoredSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

function writeSession(s: StoredSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export const http = axios.create({
  baseURL: '/api',
  timeout: 15_000,
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const session = readSession();
  if (session?.tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${session.tokens.accessToken}`;
  }
  return config;
});

// Single-flight refresh — concurrent 401s share the same refresh attempt.
let refreshPromise: Promise<string | null> | null = null;

async function refreshOnce(): Promise<string | null> {
  const session = readSession();
  if (!session?.tokens?.refreshToken) return null;
  try {
    const res = await axios.post<{
      data: { tokens: { accessToken: string; refreshToken: string } };
    }>('/api/auth/refresh', { refreshToken: session.tokens.refreshToken });
    const tokens = res.data.data.tokens;
    writeSession({ ...session, tokens });
    return tokens.accessToken;
  } catch {
    clearSession();
    if (typeof window !== 'undefined') window.location.href = '/login';
    return null;
  }
}

http.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined;
    if (
      error.response?.status === 401 &&
      original &&
      !original._retried &&
      !original.url?.includes('/auth/')
    ) {
      original._retried = true;
      refreshPromise = refreshPromise ?? refreshOnce();
      const newToken = await refreshPromise;
      refreshPromise = null;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return http.request(original);
      }
    }
    return Promise.reject(error);
  },
);
