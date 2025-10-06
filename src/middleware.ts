import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware({
  locales: ['en', 'es'],
  defaultLocale: 'es',
  localePrefix: 'always' // fuerza /en y /es
})

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log('🔍 Middleware processing:', pathname)
  
  // Skip static assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|css|js)$/)
  ) {
    console.log('✅ Skipping static asset:', pathname)
    return NextResponse.next()
  }

  // Check if the path looks like a community slug (not starting with /en or /es)
  // and not an API route or static file
  if (
    pathname.startsWith('/') && 
    !pathname.startsWith('/en/') && 
    !pathname.startsWith('/es/') &&
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/_next/') &&
    !pathname.startsWith('/favicon') &&
    !pathname.includes('.') &&
    pathname !== '/' &&
    pathname.length > 1
  ) {
    // Redirect to English version by default
    const url = request.nextUrl.clone()
    url.pathname = `/en${pathname}`
    return NextResponse.redirect(url)
  }
  
  // Use the default intl middleware for other routes
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    // Match all paths except:
    // - API routes
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - Static assets
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
