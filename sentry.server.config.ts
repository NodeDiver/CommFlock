import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV || 'development',
  enabled: process.env.NODE_ENV === 'production',
  beforeSend(event) {
    // Filter out sensitive data
    if (event.request?.data) {
      const data = event.request.data as any
      if (data.password) delete data.password
      if (data.hashedPassword) delete data.hashedPassword
      if (data.token) delete data.token
    }
    return event
  },
})
