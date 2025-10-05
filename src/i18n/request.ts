import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => {
  // Ensure locale is valid, default to 'en' if undefined
  const validLocale = locale && ['en', 'es'].includes(locale) ? locale : 'en'

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
    timeZone: 'UTC'
  }
})
