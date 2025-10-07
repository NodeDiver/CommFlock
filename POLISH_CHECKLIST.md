# Polish Completo - Checklist Detallado

**Última actualización:** 2025-10-07
**Estado:** En Progreso (Week 1)
**Plan:** 3 semanas para completar

---

## 📊 Progreso General

| Semana               | Tareas        | Completadas | Pendientes | Progreso |
| -------------------- | ------------- | ----------- | ---------- | -------- |
| Week 1: Code Quality | 5 tareas      | 1           | 4          | 20%      |
| Week 2: Performance  | 5 tareas      | 0           | 5          | 0%       |
| Week 3: UX Polish    | 5 tareas      | 0           | 5          | 0%       |
| **Total**            | **15 tareas** | **1**       | **14**     | **7%**   |

---

## Week 1: Code Quality (Estimado: 8-10 horas)

### ✅ 1. Fix All Linter Warnings [IN PROGRESS]

**Tiempo estimado:** 2-3 horas
**Progreso:** 5/21 warnings fijos (24%)

**Warnings Restantes (16):**

#### Unused Variables (4):

- [ ] `src/app/api/communities/route.ts:102` - `payment` variable not used
- [ ] `src/app/layout.tsx:5` - `geistSans` imported but not used
- [ ] `src/app/layout.tsx:10` - `geistMono` imported but not used
- [ ] `src/app/api/communities/[slug]/events/[eventId]/register/route.ts:16` - `slug` not used

**Fix:**

```typescript
// Remove unused variables or prefix with underscore
const _payment = await db.payment.create(...)
```

#### Missing useEffect Dependencies (4):

- [ ] `src/app/[locale]/[slug]/dashboard/page.tsx:63` - Add `fetchCommunity` and `router` to deps
- [ ] `src/app/[locale]/[slug]/page.tsx:43` - Add `fetchCommunity` to deps
- [ ] `src/app/[locale]/[slug]/events/[id]/page.tsx:54` - Add `fetchEvent` to deps
- [ ] `src/app/[locale]/[slug]/polls/[id]/page.tsx:56` - Add `fetchPoll` to deps

**Fix:** Wrap fetch functions in `useCallback` como hicimos en `admin/page.tsx`:

```typescript
const fetchCommunity = React.useCallback(async () => {
  // ... fetch logic
}, [slug, router]);

useEffect(() => {
  fetchCommunity();
}, [fetchCommunity]);
```

#### Any Types (4):

- [ ] `src/app/[locale]/layout.tsx:36` - `locale: any` → `locale: string`
- [ ] `src/app/api/communities/[slug]/members/route.ts:88` - Specify member type
- [ ] `src/components/providers.tsx:9` - Specify messages type
- [ ] `src/lib/i18n.ts:9` - Specify locale type

**Fix:**

```typescript
// Before
function foo(locale: any) { ... }

// After
function foo(locale: string) { ... }
```

#### Unused Imports (4):

- [ ] `src/app/api/communities/[slug]/join/route.ts:5` - `joinCommunitySchema` not used
- [ ] `src/app/api/communities/[slug]/polls/[pollId]/vote/route.ts:20` - `slug` not used

**Commands to run after fixing:**

```bash
npm run lint
npm run build  # Should show 0 warnings
```

---

### ⬜ 2. Add Code Comments to Complex Functions

**Tiempo estimado:** 2 horas

**Archivos que necesitan documentación:**

#### src/lib/auth.ts

```typescript
/**
 * Auth.js configuration for CommFlock
 *
 * Handles username + password authentication with bcrypt hashing.
 * Session management using JWT strategy with 7-day expiration.
 *
 * @see https://authjs.dev/reference/core
 */
export const authOptions: NextAuthOptions = {
  // ...
};

/**
 * Compares plain text password with hashed password
 *
 * @param password - Plain text password from user input
 * @param hashedPassword - Bcrypt hashed password from database
 * @returns Promise<boolean> - True if passwords match
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  // ...
}
```

#### src/app/api/communities/route.ts

```typescript
/**
 * GET /api/communities
 *
 * Fetches public communities with pagination support.
 * Supports two pagination modes:
 * - skip/take (client-side): Returns array directly
 * - page/limit (server-side): Returns object with pagination metadata
 *
 * @query skip - Number of records to skip (optional)
 * @query take - Number of records to return (optional)
 * @query page - Page number (optional, default: 1)
 * @query limit - Records per page (optional, default: 10)
 * @query search - Search query for name/slug (optional)
 *
 * @returns Community[] | { communities: Community[], pagination: {...} }
 */
export async function GET(request: NextRequest) {
  // ...
}
```

#### src/components/communities-grid.tsx

```typescript
/**
 * Reusable grid component for displaying communities
 *
 * Features:
 * - Optional search functionality
 * - Load more pagination
 * - Responsive grid layout
 * - Empty state handling
 *
 * @param initialCommunities - Initial communities to display
 * @param totalCount - Total number of communities available
 * @param showSearch - Whether to show search input (default: true)
 * @param showLoadMore - Whether to show load more button (default: true)
 * @param loadMoreIncrement - Number of communities to load per click (default: 6)
 */
export function CommunitiesGrid({ ... }) {
  // ...
}
```

#### src/middleware.ts

```typescript
/**
 * Next.js middleware for handling internationalization and routing
 *
 * Responsibilities:
 * 1. Skip static assets (_next/, api/, images)
 * 2. Apply next-intl middleware for locale detection
 * 3. Allow community slug routing (/en/[slug])
 *
 * @param request - Next.js request object
 * @returns Response with locale handling applied
 */
export default function middleware(request: NextRequest) {
  // ...
}
```

**Comando:**

```bash
# Verify JSDoc comments with TypeScript
npx tsc --noEmit
```

---

### ⬜ 3. Improve Test Coverage to 70%+

**Tiempo estimado:** 3-4 horas
**Cobertura actual:** ~60%
**Cobertura objetivo:** 70%+

**Tests faltantes:**

#### 1. Load More Functionality

```typescript
// tests/e2e/load-more.spec.ts
test("should load more communities when clicking Load More button", async ({
  page,
}) => {
  await page.goto("/en");

  // Count initial communities (should be 9)
  const initialCount = await page
    .locator('[data-testid="community-card"]')
    .count();
  expect(initialCount).toBe(9);

  // Click Load More
  await page.click("text=Load More");

  // Wait for new communities
  await page.waitForTimeout(1000);

  // Count should increase by 6
  const newCount = await page.locator('[data-testid="community-card"]').count();
  expect(newCount).toBe(15);
});

test("should hide Load More when all communities loaded", async ({ page }) => {
  await page.goto("/en");

  // Click Load More until no more communities
  while (await page.locator("text=Load More").isVisible()) {
    await page.click("text=Load More");
    await page.waitForTimeout(500);
  }

  // Should show "all loaded" message
  await expect(page.locator("text=That's all for now")).toBeVisible();
});
```

#### 2. Language Switching

```typescript
// tests/e2e/language-switching.spec.ts
test("should switch entire site to Spanish", async ({ page }) => {
  await page.goto("/en");

  // Check initial language
  await expect(page.locator("h1")).toContainText("CommFlock");

  // Switch to Spanish
  await page.click('[data-testid="language-toggle"]');
  await page.click("text=Español");

  // Wait for navigation
  await page.waitForURL("/es");

  // Check all sections are in Spanish
  await expect(page.locator("h1")).toContainText("Construye");
  await expect(page.locator("text=Descubre Comunidades")).toBeVisible();
  await expect(page.locator("text=Cargar Más")).toBeVisible();
});
```

#### 3. API Routes

```typescript
// tests/api/communities-pagination.test.ts
describe("GET /api/communities with skip/take", () => {
  it("should return array when using skip/take", async () => {
    const response = await fetch("/api/communities?skip=0&take=10");
    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeLessThanOrEqual(10);
  });

  it("should return object when using page/limit", async () => {
    const response = await fetch("/api/communities?page=1&limit=10");
    const data = await response.json();

    expect(data).toHaveProperty("communities");
    expect(data).toHaveProperty("pagination");
    expect(Array.isArray(data.communities)).toBe(true);
  });
});
```

**Commands:**

```bash
npm test                  # Run unit tests
npm run test:coverage     # Check coverage
npm run test:e2e          # Run E2E tests
```

**Objetivo:** Coverage report showing >70% for:

- API routes: >80%
- Components: >60%
- Utils/Libs: >70%

---

### ⬜ 4. Remove All console.logs

**Tiempo estimado:** 30 min

**Strategy:** Replace console.logs with proper logging

#### Step 1: Find all console.logs

```bash
grep -r "console.log" src/ --include="*.ts" --include="*.tsx" | grep -v "console.error"
```

**Results esperados (~15 console.logs):**

- `src/middleware.ts` - 2 logs (debugging routing)
- `src/components/language-toggle.tsx` - 5 logs (debugging language switch)
- `src/i18n/request.ts` - 1 log (debugging locale)
- Various pages - 5-10 logs

#### Step 2: Create logger utility

```typescript
// src/lib/logger.ts
const isDev = process.env.NODE_ENV === "development";

export const logger = {
  info: (...args: unknown[]) => {
    if (isDev) console.log("[INFO]", ...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn("[WARN]", ...args);
  },
  error: (...args: unknown[]) => {
    console.error("[ERROR]", ...args);
  },
  debug: (...args: unknown[]) => {
    if (isDev && process.env.DEBUG) console.log("[DEBUG]", ...args);
  },
};
```

#### Step 3: Replace console.logs

```typescript
// Before
console.log("🔍 Middleware processing:", pathname);

// After
import { logger } from "@/lib/logger";
logger.debug("Middleware processing:", pathname);
```

#### Step 4: Remove debugging logs from components

```typescript
// In language-toggle.tsx - REMOVE these:
console.log("🔍 LanguageToggle - Current path:", currentPath);
console.log("🔍 LanguageToggle - Current locale:", locale);
console.log("🔍 LanguageToggle - Switching to:", newLocale);
```

**Validation:**

```bash
# Should return 0 results (except logger.ts and error handling)
grep -r "console.log" src/ --include="*.ts" --include="*.tsx" | grep -v "logger" | grep -v "console.error"
```

---

### ⬜ 5. Update .env.example with All Variables

**Tiempo estimado:** 15 min

**Create comprehensive .env.example:**

```env
# ==========================================
# CommFlock Environment Variables
# ==========================================
# Copy this file to .env and fill in your values
# Required variables are marked with (REQUIRED)
# Optional variables will gracefully degrade if not set

# ==========================================
# Database (REQUIRED)
# ==========================================
# For local development with PostgreSQL:
DATABASE_URL="postgresql://user:password@localhost:5432/commflock?schema=public"

# For Neon PostgreSQL (production):
DATABASE_URL="postgresql://USER:PASSWORD@HOST-POOLER.neon.tech/DB?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DB?sslmode=require"

# ==========================================
# Authentication (REQUIRED)
# ==========================================
# Generate secret with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# Your site URL (used for callbacks and emails)
NEXTAUTH_URL="http://localhost:3000"  # Dev
# NEXTAUTH_URL="https://your-domain.com"  # Production

# ==========================================
# Email Service (OPTIONAL - for password reset)
# ==========================================
# Sign up at https://resend.com/
# Without this, password reset won't work
RESEND_API_KEY="re_xxxxxxxxxxxxx"

# ==========================================
# Rate Limiting (OPTIONAL - recommended for production)
# ==========================================
# Sign up at https://upstash.com/
# Without Redis, rate limiting will be disabled (dev only)
UPSTASH_REDIS_REST_URL="https://xxxxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxxxxxxxxxxxx"

# ==========================================
# Error Monitoring (OPTIONAL - recommended for production)
# ==========================================
# Sign up at https://sentry.io/
# Only active in production (NODE_ENV=production)
NEXT_PUBLIC_SENTRY_DSN="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"

# ==========================================
# Development (OPTIONAL)
# ==========================================
# Set to true to enable debug logging
DEBUG="false"

# Node environment (auto-detected, rarely needs manual setting)
# NODE_ENV="development"  # or "production" or "test"
```

**Also update README.md with env var section:**

```markdown
## Environment Variables

See `.env.example` for all available variables.

**Required:**

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Auth encryption secret
- `NEXTAUTH_URL` - Your site URL

**Optional (Production Recommended):**

- `RESEND_API_KEY` - Email service for password reset
- `UPSTASH_REDIS_REST_URL` - Rate limiting
- `UPSTASH_REDIS_REST_TOKEN` - Rate limiting
- `NEXT_PUBLIC_SENTRY_DSN` - Error monitoring
```

---

## Week 2: Performance (Estimado: 6-8 horas)

### ⬜ 1. Measure Load Times with Lighthouse

**Tiempo estimado:** 1 hora

**Steps:**

1. **Build for production:**

```bash
npm run build
npm start
```

2. **Run Lighthouse:**

```bash
# Install lighthouse CLI
npm install -g lighthouse

# Run audit on key pages
lighthouse http://localhost:3000/en --output html --output-path reports/landing.html
lighthouse http://localhost:3000/en/discover --output html --output-path reports/discover.html
lighthouse http://localhost:3000/en/sign-in --output html --output-path reports/auth.html
```

3. **Analyze results:**

- Performance score target: >90
- Best Practices target: >90
- Accessibility target: >90
- SEO target: >90

4. **Document findings:**

```markdown
# Performance Audit Results

## Landing Page (/en)

- Performance: 85/100 ⚠️
- Accessibility: 95/100 ✅
- Best Practices: 100/100 ✅
- SEO: 92/100 ✅

**Issues Found:**

1. Large CSS bundle (45KB)
2. No image optimization
3. Missing font preloading

**Action Items:**

- Optimize CSS (remove unused styles)
- Use Next/Image for all images
- Preload critical fonts
```

---

### ⬜ 2. Add Database Indexes

**Tiempo estimado:** 1-2 horas

**Create migration:**

```prisma
// prisma/schema.prisma

model Community {
  // Existing fields...

  // Add indexes for common queries
  @@index([isPublic, createdAt(sort: Desc)]) // Discovery page
  @@index([slug]) // Individual community lookup
  @@index([ownerId]) // Owner's communities
}

model CommunityMember {
  // Existing fields...

  @@index([userId, status]) // User's memberships
  @@index([communityId, status, role]) // Community members list
  @@index([communityId, points(sort: Desc)]) // Leaderboard
}

model Event {
  // Existing fields...

  @@index([communityId, status, startsAt]) // Community events
  @@index([startsAt, status]) // Upcoming events
}

model Poll {
  // Existing fields...

  @@index([communityId, createdAt(sort: Desc)]) // Community polls
  @@index([endsAt]) // Expiring polls
}

model Payment {
  // Existing fields...

  @@index([userId, status, createdAt(sort: Desc)]) // User payments
  @@index([communityId, status]) // Community revenue
  @@index([eventId]) // Event payments
}

model PasswordResetToken {
  // Existing fields...

  @@index([token]) // Token lookup
  @@index([userId, used, expiresAt]) // User's active tokens
}
```

**Apply migration:**

```bash
npx prisma migrate dev --name add_performance_indexes
npx prisma migrate deploy  # For production
```

**Verify with EXPLAIN:**

```sql
-- In Prisma Studio or pgAdmin
EXPLAIN ANALYZE
SELECT * FROM "Community"
WHERE "isPublic" = true
ORDER BY "createdAt" DESC
LIMIT 10;

-- Should show "Index Scan" instead of "Seq Scan"
```

---

### ⬜ 3. Optimize Images with Next Image

**Tiempo estimado:** 2 hours

**Current image usage audit:**

```bash
# Find all <img> tags (should use Next/Image instead)
grep -r "<img" src/ --include="*.tsx"
```

**Migration strategy:**

1. **Replace community card images** (when added):

```typescript
// Before
<img src={community.coverImage} alt={community.name} />

// After
import Image from 'next/image'

<Image
  src={community.coverImage}
  alt={community.name}
  width={300}
  height={200}
  className="object-cover"
  placeholder="blur"
  blurDataURL="/placeholder.jpg"
/>
```

2. **Configure next.config.js for external images:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["uploadthing.com", "cloudinary.com"], // If using image hosting
    formats: ["image/avif", "image/webp"],
  },
};
```

3. **Add placeholder images:**

```bash
# Create public/placeholder.jpg (small blurred image)
# Use for blur placeholder while images load
```

---

### ⬜ 4. Test on Slow 3G Connection

**Tiempo estimado:** 1 hora

**Chrome DevTools throttling:**

1. **Open DevTools** → Network tab
2. **Enable throttling** → "Slow 3G"
3. **Test critical flows:**
   - Landing page load
   - Language switching
   - Load more communities
   - Sign in flow
   - Community page load

**Document issues:**

```markdown
# 3G Performance Test Results

## Landing Page

- Initial load: 8.5s ⚠️ (target: <3s)
- Time to Interactive: 12s ⚠️ (target: <5s)
- Largest Contentful Paint: 6s ⚠️

**Bottlenecks:**

1. Large JS bundle (200KB)
2. All communities loaded at once
3. No lazy loading

**Fixes:**

- Code splitting
- Lazy load below fold
- Reduce initial bundle
```

**Improvements to implement:**

```typescript
// Lazy load components
const CommunitiesGrid = dynamic(() => import('@/components/communities-grid'), {
  loading: () => <CommunitiesGridSkeleton />,
  ssr: false
})

// Reduce initial data
// Load only 3 communities initially on slow connections
const initialLoad = navigator.connection?.effectiveType === '3g' ? 3 : 9
```

---

### ⬜ 5. Verify Mobile Responsiveness

**Tiempo estimado:** 1-2 horas

**Test devices (Chrome DevTools):**

- iPhone SE (375px)
- iPhone 12 Pro (390px)
- iPad (768px)
- Desktop (1920px)

**Checklist por página:**

#### Landing Page

- [ ] Hero text readable on mobile
- [ ] CTA buttons stack vertically
- [ ] Feature cards stack on mobile
- [ ] Communities grid: 1 col mobile, 2 col tablet, 3 col desktop
- [ ] Load More button accessible
- [ ] Footer readable

#### Discover Page

- [ ] Search bar full width on mobile
- [ ] Community cards readable
- [ ] Images scale properly

#### Auth Pages (Sign In/Up)

- [ ] Form inputs full width
- [ ] Buttons accessible
- [ ] Error messages visible

**Common fixes needed:**

```css
/* Add to globals.css if missing */
@media (max-width: 640px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  h1 {
    font-size: 2rem; /* Reduce on mobile */
  }
}
```

---

## Week 3: UX Polish (Estimado: 8-10 horas)

### ⬜ 1. Add Loading States with Skeletons

**Tiempo estimado:** 2-3 horas

**Create skeleton components:**

```typescript
// src/components/skeletons/community-card-skeleton.tsx
export function CommunityCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mt-2" />
        <div className="flex justify-between mt-4">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        </div>
      </CardContent>
    </Card>
  )
}

// src/components/skeletons/community-grid-skeleton.tsx
export function CommunityGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CommunityCardSkeleton key={i} />
      ))}
    </div>
  )
}
```

**Use in pages:**

```typescript
// src/app/[locale]/(public)/page.tsx
import { Suspense } from 'react'
import { CommunityGridSkeleton } from '@/components/skeletons/community-grid-skeleton'

export default async function HomePage() {
  return (
    <div>
      {/* Hero */}

      {/* Communities Section */}
      <Suspense fallback={<CommunityGridSkeleton />}>
        <CommunitiesSection />
      </Suspense>
    </div>
  )
}
```

**Also add to:**

- Discover page
- Community page
- Dashboard loading
- Admin panel loading

---

### ⬜ 2. Improve Error Messages

**Tiempo estimado:** 1-2 horas

**Strategy:** Replace generic errors with user-friendly messages

#### Authentication Errors

```typescript
// src/app/api/auth/signup/route.ts

// Before
return NextResponse.json({ error: "Invalid input" }, { status: 400 });

// After
return NextResponse.json(
  {
    error: "Please check your information",
    details: {
      username: "Username must be 3-20 characters",
      password: "Password must be at least 6 characters",
    },
  },
  { status: 400 },
);
```

#### Network Errors

```typescript
// src/components/communities-grid.tsx

// Before
console.error("Error loading communities");

// After
toast.error(
  "Unable to load communities. Please check your connection and try again.",
);
```

#### Validation Errors

```typescript
// src/lib/validators.ts

export const createCommunitySchema = z.object({
  name: z
    .string()
    .min(3, "Community name must be at least 3 characters")
    .max(50, "Community name must be less than 50 characters"),
  slug: z
    .string()
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  // ...
});
```

**Create error component:**

```typescript
// src/components/error-message.tsx
export function ErrorMessage({ error, retry }: { error: string, retry?: () => void }) {
  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          {retry && (
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={retry}
            >
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

### ⬜ 3. Add Success Toasts

**Tiempo estimado:** 1 hora

**Already using Sonner - expand usage:**

```typescript
// src/components/communities-grid.tsx
import { toast } from "sonner";

const handleLoadMore = async () => {
  try {
    // ... fetch logic

    if (newCommunities.length > 0) {
      toast.success(`Loaded ${newCommunities.length} more communities`);
    } else {
      toast.info("No more communities to load");
    }
  } catch (error) {
    toast.error("Failed to load more communities");
  }
};
```

**Add to all user actions:**

#### Sign Up

```typescript
toast.success("Account created! Redirecting to sign in...");
```

#### Sign In

```typescript
toast.success("Welcome back!");
```

#### Password Reset

```typescript
toast.success("Password reset email sent! Check your inbox.");
```

#### Community Actions

```typescript
toast.success("Community created successfully!");
toast.success("Joined community!");
toast.success("Event registration confirmed!");
toast.success("Vote submitted!");
```

**Configure toast position:**

```typescript
// src/components/providers.tsx
<Toaster position="top-right" richColors />
```

---

### ⬜ 4. Test Keyboard Navigation

**Tiempo estimado:** 2 horas

**Test all interactive elements:**

#### Focus Order

```bash
# Test tab order on each page:
1. Landing: Logo → Language → Theme → Create → Discover → Communities → Load More → Footer links
2. Auth: Email → Username → Password → Submit → Links
3. Discover: Search → Communities → Load More
```

**Issues to fix:**

1. **Skip to main content:**

```typescript
// src/app/[locale]/layout.tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-50">
  Skip to main content
</a>

<main id="main-content">
  {children}
</main>
```

2. **Focus visible styles:**

```css
/* globals.css */
*:focus-visible {
  outline: 2px solid theme("colors.blue.500");
  outline-offset: 2px;
}
```

3. **Keyboard shortcuts:**

```typescript
// Add to layout
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Cmd/Ctrl + K for search
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      // Focus search input
    }

    // Escape to close modals
    if (e.key === "Escape") {
      // Close active modal
    }
  };

  window.addEventListener("keydown", handleKeyPress);
  return () => window.removeEventListener("keydown", handleKeyPress);
}, []);
```

**Manual testing checklist:**

- [ ] Can navigate entire site with Tab key
- [ ] Can activate buttons with Enter/Space
- [ ] Can close modals with Escape
- [ ] Focus indicators visible
- [ ] No keyboard traps

---

### ⬜ 5. Add Aria-Labels for Accessibility

**Tiempo estimado:** 2 horas

**Audit current accessibility:**

```bash
# Install axe-core for automated testing
npm install -D @axe-core/cli

# Run accessibility audit
npx axe http://localhost:3000/en
```

**Common fixes needed:**

#### 1. Button labels

```typescript
// Before
<Button onClick={switchLocale}>
  <Languages className="h-5 w-5" />
</Button>

// After
<Button
  onClick={switchLocale}
  aria-label="Switch language"
>
  <Languages className="h-5 w-5" />
</Button>
```

#### 2. Form inputs

```typescript
// All inputs need labels
<Label htmlFor="email">Email</Label>
<Input
  id="email"
  type="email"
  aria-describedby="email-error"
  aria-invalid={!!errors.email}
/>
{errors.email && (
  <span id="email-error" className="text-red-600">
    {errors.email}
  </span>
)}
```

#### 3. Navigation

```typescript
<nav aria-label="Main navigation">
  {/* nav items */}
</nav>

<nav aria-label="Footer navigation">
  {/* footer links */}
</nav>
```

#### 4. Landmarks

```typescript
<header role="banner">
  {/* Header content */}
</header>

<main role="main">
  {/* Main content */}
</main>

<footer role="contentinfo">
  {/* Footer content */}
</footer>
```

#### 5. Dynamic content

```typescript
// Loading states
<div role="status" aria-live="polite">
  {isLoading ? 'Loading communities...' : `Showing ${count} communities`}
</div>

// Error messages
<div role="alert" aria-live="assertive">
  {error}
</div>
```

**Screen reader testing:**

- macOS: VoiceOver (Cmd + F5)
- Windows: NVDA (free)
- Test critical flows with eyes closed

---

## 📊 Tracking Progress

### Daily Standup Questions

1. What did I complete yesterday?
2. What will I work on today?
3. Any blockers?

### Weekly Review

- Review completed tasks
- Update POLISH_CHECKLIST.md
- Commit progress
- Plan next week

### Success Metrics

**Week 1:**

- [ ] 0 linter warnings
- [ ] > 70% test coverage
- [ ] 0 console.logs in production
- [ ] Comprehensive .env.example

**Week 2:**

- [ ] Lighthouse score >90 on all pages
- [ ] All database queries using indexes
- [ ] <3s load time on 3G
- [ ] 100% mobile responsive

**Week 3:**

- [ ] All pages have loading states
- [ ] All errors have retry options
- [ ] All actions have success toasts
- [ ] 100% keyboard navigable
- [ ] Axe accessibility score >95

---

## 🎯 Final Checklist

Before marking "Polish Completo" as done:

- [ ] Run full test suite: `npm test && npm run test:e2e`
- [ ] Run Lighthouse on all pages
- [ ] Build succeeds with 0 warnings: `npm run build`
- [ ] Deploy to staging
- [ ] Manual QA testing
- [ ] Get user feedback
- [ ] Document any new issues
- [ ] Update README.md
- [ ] Git tag release: `git tag v0.3.0`

---

**Última actualización:** 2025-10-07
**Próxima revisión:** Fin de Week 1 (2025-10-14)
