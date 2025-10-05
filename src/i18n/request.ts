import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => {
  // Ensure locale is valid, default to 'es' if undefined
  const validLocale = locale && ['en', 'es'].includes(locale) ? locale : 'es'
  
  console.log('🔍 getRequestConfig called with locale:', locale, 'validLocale:', validLocale)

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
    timeZone: 'UTC'
  }
})
