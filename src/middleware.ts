import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["en", "es"],
  defaultLocale: "en",
  localePrefix: "always", // fuerza /en y /es
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("🔍 Middleware processing:", pathname);

  // Skip static assets
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|css|js)$/)
  ) {
    console.log("✅ Skipping static asset:", pathname);
    return NextResponse.next();
  }

  // Apply intl middleware first to handle locale detection
  const intlResponse = intlMiddleware(request);

  // If intl middleware is redirecting, let it handle the request
  if (intlResponse.status === 307 || intlResponse.status === 308) {
    return intlResponse;
  }

  // Check if the path looks like a community slug (after locale is added)
  // Pattern: /[locale]/[slug] where slug doesn't match known routes
  const knownRoutes = [
    "/discover",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
  ];
  const localeMatch = pathname.match(/^\/(en|es)(\/.*)?$/);

  if (localeMatch) {
    const afterLocale = localeMatch[2] || "";

    // If path is like /en/something and something is not a known route
    if (
      afterLocale &&
      afterLocale !== "/" &&
      !knownRoutes.some((route) => afterLocale.startsWith(route)) &&
      !afterLocale.startsWith("/api/")
    ) {
      // This might be a community slug, let it pass through
      return intlResponse;
    }
  }

  return intlResponse;
}

export const config = {
  matcher: [
    // Match all paths except:
    // - API routes
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - Static assets
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
