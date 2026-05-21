import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN_FRONTEND ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? 'production',
    tracesSampleRate: 0.05,
  });
}
