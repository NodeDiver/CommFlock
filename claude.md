# CommFlock - Claude Developer Guide

## Project Overview

CommFlock is a multi-tenant community platform built for coordination and engagement. Users can create or join communities (auto-join or approval-based), post announcements, create events with capacity limits, run polls, award badges, and manage points-based leaderboards. The platform is Lightning-first with simulated payments in v1, preparing for real Lightning Network integration via NWC in Phase 2.

**Key Characteristics:**
- Multi-tenant by slug (e.g., `commflock.com/gordosbala`)
- Internationalized (English/Spanish) from day one
- Lightning payment infrastructure (simulated in v1)
- Modern stack: Next.js 15, Prisma, PostgreSQL, shadcn/ui

**Current Status:** Phase 1 MVP - Core features complete, ready for Lightning integration

---

## Architecture

### Tech Stack

**Frontend:**
- Next.js 15.5.4 (App Router, Server Components)
- React 18.3.1
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui components
- next-intl for i18n
- react-hook-form + Zod validation
- next-themes for dark mode

**Backend:**
- Next.js API Routes
- Auth.js (NextAuth) for authentication
- Prisma 6.16.3 ORM
- PostgreSQL (Neon in production)
- SQLite (local development option)

**Deployment:**
- Netlify with Next.js plugin
- Neon PostgreSQL (serverless)
- Environment-based configuration

### Folder Structure

```
src/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Internationalized routes (en/es)
│   │   ├── (auth)/              # Auth pages (sign-in, sign-up)
│   │   ├── (public)/            # Public pages (landing)
│   │   ├── [slug]/              # Community pages (multi-tenant)
│   │   │   ├── page.tsx         # Community home
│   │   │   ├── dashboard/       # Member dashboard
│   │   │   ├── admin/           # Admin panel
│   │   │   ├── events/[id]/     # Event details
│   │   │   └── polls/[id]/      # Poll details
│   │   ├── create/              # Create community
│   │   └── discover/            # Explore communities
│   ├── api/                      # API Routes
│   │   ├── auth/                # NextAuth endpoints
│   │   ├── communities/         # Community CRUD + operations
│   │   ├── payments/            # Payment simulation
│   │   └── health/              # Health check
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── theme-provider.tsx       # Dark mode provider
│   ├── theme-toggle.tsx         # Theme switcher
│   └── language-toggle.tsx      # Language switcher
├── lib/
│   ├── auth.ts                  # Auth.js configuration
│   ├── db.ts                    # Prisma client
│   ├── validators.ts            # Zod schemas
│   ├── slug.ts                  # Slug utilities
│   ├── i18n.ts                  # i18n configuration
│   └── utils.ts                 # Utility functions
├── messages/
│   ├── en.json                  # English translations
│   └── es.json                  # Spanish translations
├── i18n/
│   └── request.ts               # i18n request configuration
├── middleware.ts                # Next.js middleware (routing)
└── styles/                      # Additional styles

prisma/
├── schema.prisma                # Database schema
├── migrations/                  # Migration history
├── seed.ts                      # Database seeding
└── dev.db                       # SQLite dev database
```

### Key Architectural Patterns

**1. Multi-tenancy via Slug**
- Each community has a unique slug
- Routes: `/[locale]/[slug]/*` (e.g., `/en/gordosbala/dashboard`)
- Middleware redirects `/slug` → `/en/slug` for convenience
- Community context determined by URL slug

**2. Internationalization**
- All routes prefixed with locale: `/en/*` or `/es/*`
- Default locale: Spanish (`es`)
- Locale enforcement via middleware (src/middleware.ts:4-8)
- Messages stored in JSON files, accessed via `next-intl`

**3. Authentication Flow**
- Simple username-based auth (no passwords in v1)
- Auto-creates users on first sign-in (src/lib/auth.ts:26-33)
- JWT session strategy
- Session data includes: `id`, `username`, `email`

**4. Data Access Pattern**
- Server Components fetch data directly via Prisma
- API routes for mutations
- No React Query on client side currently
- Optimistic updates not implemented

---

## Development Guide

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ OR SQLite 3
- npm or pnpm

### Initial Setup

```bash
# Clone and install
git clone <repo-url>
cd CommFlock
npm install

# Configure environment
cp env.example .env
# Edit .env with your database credentials

# Database setup (choose one)
# Option A: SQLite (local dev)
DATABASE_URL="file:./dev.db"

# Option B: PostgreSQL (local)
DATABASE_URL="postgresql://user:pass@localhost:5432/commflock"

# Option C: Neon (shared dev/production)
DATABASE_URL="postgresql://user:pass@host-pooler.neon.tech/db?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"

# Auth configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Run migrations and seed
npm run db:generate
npm run db:migrate
npm run seed

# Start development server
npm run dev
```

### Common Tasks

**Database Operations:**
```bash
npm run db:migrate          # Create new migration
npm run db:migrate:deploy   # Deploy migrations (production)
npm run db:generate         # Regenerate Prisma client
npm run db:reset            # Reset database (DESTRUCTIVE)
npm run prisma:studio       # Open Prisma Studio
npm run seed                # Seed demo data
```

**Development:**
```bash
npm run dev                 # Start dev server (localhost:3000)
npm run build               # Production build
npm run start               # Start production server
npm run lint                # Run ESLint
```

### Debugging Tips

**1. Database Issues**
- Check Prisma client is generated: `npm run db:generate`
- Verify DATABASE_URL is correct
- For Neon: ensure both `DATABASE_URL` and `DIRECT_URL` are set
- Use Prisma Studio to inspect data: `npm run prisma:studio`

**2. i18n Issues**
- Verify locale is in URL path (`/en/*` or `/es/*`)
- Check message keys exist in both `en.json` and `es.json`
- Clear `.next` cache: `rm -rf .next && npm run dev`

**3. Authentication Issues**
- Verify `NEXTAUTH_URL` matches your actual URL
- Check `NEXTAUTH_SECRET` is set
- Inspect JWT token in browser DevTools → Application → Cookies

**4. Build Errors**
- Clear build cache: `rm -rf .next`
- Regenerate Prisma client: `npm run db:generate`
- Check TypeScript errors: `npx tsc --noEmit`

---

## Codebase Navigation

### Where to Find...

**Authentication Logic**
- Configuration: `src/lib/auth.ts`
- API endpoint: `src/app/api/auth/[...nextauth]/route.ts`
- Sign-in page: `src/app/[locale]/(auth)/sign-in/page.tsx`
- Sign-up page: `src/app/[locale]/(auth)/sign-up/page.tsx`

**Community Features**
- Create community: `src/app/[locale]/create/page.tsx`
- Community home: `src/app/[locale]/[slug]/page.tsx`
- Community admin: `src/app/[locale]/[slug]/admin/page.tsx`
- Member dashboard: `src/app/[locale]/[slug]/dashboard/page.tsx`
- Discover page: `src/app/[locale]/discover/page.tsx`

**Events & Polls**
- Event detail: `src/app/[locale]/[slug]/events/[id]/page.tsx`
- Poll detail: `src/app/[locale]/[slug]/polls/[id]/page.tsx`

**API Routes**
- Communities: `src/app/api/communities/route.ts`
- Join community: `src/app/api/communities/[slug]/join/route.ts`
- Event registration: `src/app/api/communities/[slug]/events/[eventId]/register/route.ts`
- Poll voting: `src/app/api/communities/[slug]/polls/[pollId]/vote/route.ts`
- Payment simulation: `src/app/api/payments/simulate/route.ts`
- Health check: `src/app/api/health/route.ts`

**Validation & Types**
- Zod schemas: `src/lib/validators.ts`
- Prisma models: `prisma/schema.prisma`
- TypeScript types: Generated from Prisma schema

**UI Components**
- shadcn/ui: `src/components/ui/*`
- Theme provider: `src/components/theme-provider.tsx`
- Theme toggle: `src/components/theme-toggle.tsx`
- Language toggle: `src/components/language-toggle.tsx`

**Internationalization**
- Middleware: `src/middleware.ts`
- i18n config: `src/lib/i18n.ts`, `src/i18n/request.ts`
- Translations: `src/messages/en.json`, `src/messages/es.json`

---

## Key Files Reference

### Critical Files (Don't break these!)

**src/middleware.ts**
- Handles locale routing (forces `/en/*` or `/es/*`)
- Redirects bare community slugs: `/slug` → `/en/slug`
- Must run before all requests (except API/static)

**src/lib/auth.ts**
- Auth.js configuration
- Auto-creates users on sign-in (SECURITY NOTE: Too permissive for production)
- JWT callbacks for session management
- Custom sign-in/sign-up page paths

**src/lib/db.ts**
- Singleton Prisma client
- Prevents multiple instances in dev mode
- Connection pooling configuration

**prisma/schema.prisma**
- Single source of truth for database schema
- Changes require migration: `npm run db:migrate`
- Supports both PostgreSQL and SQLite via datasource swap

**next.config.ts**
- Next.js configuration
- Integrates next-intl plugin
- Prisma external package handling
- Image optimization settings

**netlify.toml**
- Deployment configuration
- Build command includes migrations
- Security headers
- Redirects configuration

### Environment Variables

**Required:**
```env
DATABASE_URL=              # Pooled connection (runtime)
DIRECT_URL=                # Direct connection (migrations) - PostgreSQL only
NEXTAUTH_URL=              # Application URL
NEXTAUTH_SECRET=           # JWT signing secret
```

**Optional:**
```env
NODE_ENV=development       # Environment mode
```

---

## API Routes Documentation

### Authentication

**POST /api/auth/callback/credentials**
- NextAuth credentials callback
- Body: `{ username: string, email?: string }`
- Response: Sets session cookie

**GET /api/auth/session**
- Get current session
- Response: `{ user: { id, username, email } }` or `null`

### Communities

**POST /api/communities**
- Create new community
- Auth: Required
- Body: `CreateCommunityInput` (see src/lib/validators.ts:3-11)
- Returns: Created community object

**GET /api/communities/[slug]**
- Get community details
- Auth: Optional (public communities only)
- Returns: Community object with members, events, polls

**POST /api/communities/[slug]/join**
- Join a community
- Auth: Required
- Body: `JoinCommunityInput` (lightningAddress, nostrPubkey if required)
- Returns: Membership object

**GET /api/communities/[slug]/members**
- List community members
- Auth: Required (member or admin)
- Query params: `?status=APPROVED` (optional)
- Returns: Array of members with user info

### Events

**POST /api/communities/[slug]/events**
- Create event (admin only)
- Auth: Required (admin)
- Body: `CreateEventInput` (see src/lib/validators.ts:13-20)
- Returns: Created event

**GET /api/communities/[slug]/events/[eventId]**
- Get event details
- Auth: Optional (public) or Required (private)
- Returns: Event with registrations

**POST /api/communities/[slug]/events/[eventId]/register**
- Register for event
- Auth: Required
- Body: `{}` (empty for free events)
- Returns: Registration object

### Polls

**POST /api/communities/[slug]/polls**
- Create poll (admin only)
- Auth: Required (admin)
- Body: `CreatePollInput` (see src/lib/validators.ts:22-29)
- Returns: Created poll

**GET /api/communities/[slug]/polls/[pollId]**
- Get poll details and results
- Auth: Required (member)
- Returns: Poll with votes

**POST /api/communities/[slug]/polls/[pollId]/vote**
- Vote on poll
- Auth: Required (member)
- Body: `VoteInput` (see src/lib/validators.ts:42-44)
- Returns: Vote object

### Payments

**POST /api/payments/simulate**
- Simulate Lightning payment (v1 only)
- Auth: Required
- Body: `{ amountSats: number, purpose: string }`
- Returns: Payment object with PAID_SIMULATED status

### Health

**GET /api/health**
- Health check endpoint
- Auth: None
- Returns: `{ status: 'ok', timestamp: string }`

---

## Database Schema Overview

### Core Models

**User**
- Primary: `id` (cuid), `username` (unique)
- Optional: `email`, `lightningAddress`, `nostrPubkey`
- Relations: memberships, badges, payments, content (announcements, polls, events)

**Community**
- Primary: `id`, `slug` (unique)
- Fields: `name`, `description`, `isPublic`, `joinPolicy`, owner
- Settings: `requiresLightningAddress`, `requiresNostrPubkey`
- Relations: members, events, polls, announcements, badges, payments

**CommunityMember** (Join table)
- Composite key: `[userId, communityId]`
- Fields: `role` (OWNER/ADMIN/MEMBER), `status` (PENDING/APPROVED/REJECTED/LEFT)
- Gamification: `points` (integer)

**Event**
- Fields: `title`, `startsAt`, `endsAt`, `capacity`, `priceSats`
- Status: DRAFT/OPEN/CONFIRMED/CANCELLED/EXPIRED
- Quorum: `minQuorum` (minimum registrations)
- Relations: registrations, payments

**Poll**
- Fields: `question`, `options` (JSON array), `endsAt`, `visibleVotes`
- Options format: `[{ key: string, label: string }]`
- Relations: votes (one per user per poll)

**Payment**
- Fields: `amountSats`, `status` (PENDING/PAID_SIMULATED/REFUNDED/CANCELLED)
- Context: Can link to `community`, `event`, or `crowdfund`
- Provider: `providerMeta` (JSON) for Lightning invoice data

### Key Relationships

```
User (1) ──→ (N) CommunityMember ←── (1) Community
User (1) ──→ (N) Payment
User (1) ──→ (N) PollVote ←── (1) Poll
Community (1) ──→ (N) Event
Community (1) ──→ (N) Poll
Community (1) ──→ (N) Announcement
Event (1) ──→ (N) EventRegistration ←── (1) User
Event (1) ──→ (N) Payment
```

### Enums

- **MemberRole**: OWNER, ADMIN, MEMBER
- **MemberStatus**: PENDING, APPROVED, REJECTED, LEFT
- **CommunityJoinPolicy**: AUTO_JOIN, APPROVAL_REQUIRED, CLOSED
- **EventStatus**: DRAFT, OPEN, CONFIRMED, CANCELLED, EXPIRED
- **PaymentStatus**: PENDING, PAID_SIMULATED, REFUNDED, CANCELLED

---

## Contributing Guidelines

### Code Style

**TypeScript:**
- Use strict mode (already configured)
- Prefer type inference over explicit types
- Use Zod schemas for runtime validation
- Export types from validators: `type X = z.infer<typeof xSchema>`

**React/Next.js:**
- Prefer Server Components (default in App Router)
- Use Client Components only when necessary (`'use client'`)
- Async components are fine in Server Components
- Use `await params` in page components (Next.js 15 requirement)

**Naming Conventions:**
- Components: PascalCase (`UserProfile.tsx`)
- Files: kebab-case (`user-profile.tsx`)
- API routes: kebab-case (`/api/communities/[slug]/join/route.ts`)
- Database models: PascalCase (`CommunityMember`)
- Database fields: camelCase (`joinPolicy`)

**File Organization:**
- One component per file
- Colocate related components in feature folders
- Keep API route handlers focused (single responsibility)
- Extract business logic to `src/lib/*` utilities

### Git Workflow

**Branches:**
- `main` - Production-ready code
- Feature branches: `feature/description`
- Bug fixes: `fix/description`

**Commits:**
- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
- Keep commits atomic and focused
- Reference issues: `fix: Resolve issue #123`

**Pull Requests:**
- Keep PRs small and focused
- Include description of changes
- Test locally before submitting
- Update documentation if needed

### Testing (Future)

**Currently Missing (Phase 2):**
- Unit tests (consider Vitest)
- Integration tests (API routes)
- E2E tests (Playwright)

**When adding tests:**
- Test user flows, not implementation
- Mock external dependencies (database, auth)
- Aim for >80% coverage on critical paths

### Performance Considerations

**Current Issues:**
- Excessive animations on landing page (may impact performance)
- No image optimization strategy
- No caching strategy for API routes

**Best Practices:**
- Use Next.js Image component for images
- Implement React Suspense for loading states
- Consider ISR (Incremental Static Regeneration) for community pages
- Add database indexes for common queries

---

## Known Issues & Limitations

### Security (High Priority)

1. **Authentication Too Permissive**
   - Auto-creates users without verification (src/lib/auth.ts:26-33)
   - No password validation
   - No rate limiting on sign-up
   - **Action Required:** Add email verification or OAuth before production

2. **Missing CSRF Protection**
   - API routes not protected against CSRF attacks
   - **Action Required:** Implement CSRF tokens or SameSite cookies

3. **Input Sanitization**
   - User input not sanitized for XSS
   - **Action Required:** Add DOMPurify or similar

4. **Authorization Checks**
   - Need to audit all API routes for proper role checks
   - Some routes may be missing ownership verification

### Functionality

5. **Payment Simulation Only**
   - All payments set to PAID_SIMULATED status
   - No real Lightning Network integration
   - **Phase 2:** Implement NWC (Nostr Wallet Connect)

6. **No Email Notifications**
   - Users not notified of events, approvals, etc.
   - **Phase 2:** Integrate email service (SendGrid, Resend)

7. **Limited Media Support**
   - No image uploads for community covers/avatars
   - **Phase 2:** Add file upload (S3, Cloudinary)

8. **Manual Translation Loading**
   - Workaround in landing page (src/app/[locale]/(public)/page.tsx:16)
   - Should use proper getRequestConfig
   - **Action:** Debug next-intl configuration

### Development

9. **No Automated Testing**
   - No test suite currently
   - **Action:** Add tests before scaling

10. **No CI/CD Pipeline**
    - Manual deployment process
    - **Action:** Set up GitHub Actions

11. **Error Handling Inconsistent**
    - Some API routes return different error formats
    - **Action:** Standardize error responses

### Performance

12. **Excessive Animations**
    - Landing page has many animation classes
    - May impact performance on slower devices
    - **Action:** Audit and optimize

13. **No Caching Strategy**
    - All data fetched on every request
    - **Action:** Implement React Query or SWR

---

## Future Roadmap (Phase 2)

### Lightning Integration
- [ ] Real Lightning payments via NWC
- [ ] Invoice generation and verification
- [ ] Automatic refunds for cancelled events
- [ ] Lightning address validation

### Authentication & Security
- [ ] OAuth providers (Google, GitHub)
- [ ] Nostr authentication (NIP-07)
- [ ] Email verification
- [ ] Password reset flow
- [ ] Rate limiting
- [ ] CSRF protection
- [ ] Input sanitization

### Features
- [ ] Email notifications (event reminders, approvals)
- [ ] Push notifications (web push)
- [ ] Media uploads (community covers, user avatars)
- [ ] Rich text editor for announcements
- [ ] Comment system
- [ ] Direct messaging
- [ ] Community moderation tools (ban, mute, report)
- [ ] Advanced badge system (achievements)

### Analytics & Metrics
- [ ] Community dashboard (member growth, engagement)
- [ ] Event analytics (attendance, revenue)
- [ ] User activity tracking
- [ ] Admin metrics dashboard

### Developer Experience
- [ ] Comprehensive test suite (unit, integration, E2E)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Monitoring/observability (Sentry, DataDog)
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Storybook for components

### Performance & Scale
- [ ] React Query for client-side caching
- [ ] ISR for community pages
- [ ] CDN for static assets
- [ ] Database query optimization
- [ ] Connection pooling improvements

---

## Quick Reference

### File Paths Cheat Sheet
```
Auth config:           src/lib/auth.ts
DB client:             src/lib/db.ts
Validation schemas:    src/lib/validators.ts
DB schema:             prisma/schema.prisma
Middleware:            src/middleware.ts
i18n config:           src/i18n/request.ts
Translations:          src/messages/{en,es}.json
Landing page:          src/app/[locale]/(public)/page.tsx
Community page:        src/app/[locale]/[slug]/page.tsx
Create community:      src/app/[locale]/create/page.tsx
API routes:            src/app/api/**/*.ts
UI components:         src/components/ui/*.tsx
```

### Common Commands
```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run lint                   # Run linter

# Database
npm run db:migrate             # Create & apply migration
npm run db:generate            # Regenerate Prisma client
npm run prisma:studio          # Open DB GUI
npm run seed                   # Seed demo data

# Deployment
npm run db:migrate:deploy      # Production migrations
```

### Useful Links
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Auth.js Docs](https://authjs.dev)
- [next-intl Docs](https://next-intl.dev)
- [shadcn/ui](https://ui.shadcn.com)
- [Neon Docs](https://neon.tech/docs)
- [Netlify Next.js Plugin](https://github.com/netlify/netlify-plugin-nextjs)

---

## Getting Help

**Common Issues:**
1. Build errors → Clear `.next` and regenerate Prisma client
2. Database errors → Check `DATABASE_URL`, run migrations
3. i18n errors → Verify locale in URL, check message keys
4. Auth errors → Verify `NEXTAUTH_SECRET` is set

**Debugging Steps:**
1. Check browser console for errors
2. Check server console for logs
3. Inspect Network tab for API errors
4. Use Prisma Studio to verify database state
5. Clear Next.js cache: `rm -rf .next`

**Need More Help?**
- Check GitHub Issues
- Review recent commits for similar changes
- Consult Next.js/Prisma documentation
- Ask the maintainers

---

**Last Updated:** 2025-10-05
**Version:** 1.0 (Phase 1 MVP)
