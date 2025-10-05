import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['en', 'es'],
  defaultLocale: 'es',
  localePrefix: 'always' // fuerza /en y /es
})

// Importante: incluir la raíz y todo lo demás
export const config = {
  matcher: ['/', '/(en|es)/:path*']
}
