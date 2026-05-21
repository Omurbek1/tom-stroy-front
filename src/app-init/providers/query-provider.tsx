'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode, useState } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Treat fetched data as fresh for 1 min by default → меньше
            // лишних запросов при навигации между табами/страницами.
            // Отдельные queries могут переопределить staleTime локально.
            staleTime: 60_000,
            // Keep cached entries 10 min after they go unused. Возвращаемся
            // на страницу — данные уже в памяти, мгновенный рендер.
            gcTime: 10 * 60_000,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: 'always',
            retry: (failureCount, error) => {
              // Не ретраим 4xx — клиентская ошибка, ретрай не поможет.
              const status =
                (error as { response?: { status?: number } })?.response?.status ?? 0;
              if (status >= 400 && status < 500) return false;
              return failureCount < 2;
            },
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
          },
          mutations: { retry: 0 },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV !== 'production' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
