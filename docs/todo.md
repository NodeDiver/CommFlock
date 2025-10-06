# CommFlock - Development Roadmap

This document outlines the planned features and improvements for CommFlock.

## Immediate Fixes

- [x] Restore the required `<html>`/`<body>` structure in `src/app/layout.tsx` so Next.js can render the tree without hitting the "Root layout must return html/body tags" runtime error.
- [x] Correct the translation loader import in `src/lib/i18n.ts` (point it at `src/messages`) to eliminate the `Failed to load Intl messages` exception on every request.
- [x] Make every navigation path locale-aware: update `router.push`/`Link` calls in the auth, discover, create, and community pages plus `pages.signIn/pages.signUp` in `src/lib/auth.ts` so they reuse the active locale instead of 404ing on `/sign-in`.
- [x] Convert `src/app/[locale]/(public)/page.tsx` to a client component (or refactor to a server-safe pattern) so that using `useTranslations`/`useLocale` doesn't trigger the "Hooks can only be used in client components" build failure.
- [ ] Add the missing invariants in the API layer: confirm the community slug before registering for an event, run `joinCommunitySchema`/new Zod checks in the members endpoint, and replace the `any` payloads with typed objects.
- [x] Align `createCommunitySchema` with `POST /api/communities` so the slug can be optional when the server generates it via `generateSlug`.
- [x] Replace the hard-coded English UI strings in the sign-in/up, discover, community, and admin pages with `next-intl` keys to keep both locales in sync.
- [ ] Fill in or remove the admin quick links that point to non-existent routes (`/[slug]/admin/announcements`, `events`, `polls`) to prevent broken navigation.

## Recently Completed

- [x] **User Authentication Enhancement**: Added optional Lightning Address and Nostr Pubkey fields to user registration
- [x] **Real-time Slug Generation**: Implemented automatic slug generation from community names with user override capability
- [x] **Database Schema Updates**: Verified and confirmed database properly handles new user fields
- [x] **Form Validation**: Added client and server-side validation for Lightning Address and Nostr Pubkey formats
- [x] **Internationalization**: Added translations for new form fields in both English and Spanish

## Phase 2 - Enhanced Authentication

### Multiple Auth Providers
- [ ] Google OAuth integration
- [ ] GitHub OAuth integration
- [ ] X (Twitter) OAuth integration
- [ ] Nostr authentication (NIP-07/98)
- [ ] Passkeys support (optional)
- [ ] Email/password authentication for production

### User Profile Enhancements
- [ ] Profile pictures and avatars
- [ ] User bio and social links
- [x] Lightning address management (basic support added)
- [x] Nostr pubkey management (basic support added)
- [ ] Privacy settings

## Phase 2 - Real Lightning Payments

### NWC Integration
- [ ] Replace simulated payments with real NWC flows
- [ ] Frontend NWC URI connection
- [ ] Invoice creation and tracking
- [ ] Payment status webhooks
- [ ] Refund functionality

### Wallet Management
- [ ] User wallet connection
- [ ] Lightning address verification
- [ ] Balance display
- [ ] Transaction history
- [ ] Payment notifications

## Phase 2 - Advanced Community Features

### Events System
- [ ] Event quorum logic and enforcement
- [ ] Deadline/expiry job processing
- [ ] Event capacity management
- [ ] Attendee management
- [ ] Event notifications and reminders

### Crowdfunding
- [ ] Real crowdfunding goal tracking
- [ ] Contribution management
- [ ] Goal confirmation logic
- [ ] Refund handling for failed goals
- [ ] Progress visualization

### Moderation Tools
- [ ] Content reporting system
- [ ] Soft-ban functionality
- [ ] Community guidelines enforcement
- [ ] Automated moderation rules
- [ ] Appeal process

## Phase 2 - Communication & Notifications

### Email System
- [ ] Email notifications for events
- [ ] Community announcements via email
- [ ] Password reset functionality
- [ ] Email verification
- [ ] Newsletter subscriptions

### Push Notifications
- [ ] Browser push notifications
- [ ] Mobile app notifications (future)
- [ ] Notification preferences
- [ ] Real-time updates

## Phase 2 - Media & Content

### File Uploads
- [ ] Community cover image uploads
- [ ] Event image uploads
- [ ] User avatar uploads
- [ ] File storage integration (AWS S3/Cloudinary)
- [ ] Image optimization and resizing

### Rich Content
- [ ] Markdown support for announcements
- [ ] Image embedding in posts
- [ ] Link previews
- [ ] Code syntax highlighting

## Phase 2 - Analytics & Insights

### Metrics Dashboard
- [ ] Community growth analytics
- [ ] Event attendance tracking
- [ ] Member engagement metrics
- [ ] Payment analytics
- [ ] Custom dashboard widgets

### SEO & Discovery
- [ ] SEO optimization for public communities
- [ ] Open Graph meta tags per community
- [ ] Dynamic OG image generation
- [ ] Sitemap generation
- [ ] Search engine indexing

## Phase 2 - Performance & Scalability

### Database Optimization
- [ ] Database indexing optimization
- [ ] Query performance monitoring
- [ ] Connection pooling
- [ ] Database caching layer
- [ ] Read replicas for scaling

### Frontend Performance
- [ ] Code splitting optimization
- [ ] Image lazy loading
- [ ] Bundle size monitoring
- [ ] CDN integration
- [ ] Service worker for caching

## Phase 2 - Developer Experience

### Testing
- [ ] Unit tests with Jest/Vitest
- [ ] Integration tests
- [ ] E2E tests with Playwright
- [ ] API testing with Supertest
- [ ] Visual regression testing

### Monitoring & Logging
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] User analytics
- [ ] API usage tracking
- [ ] Log aggregation

### CI/CD
- [ ] GitHub Actions workflows
- [ ] Automated testing
- [ ] Deployment automation
- [ ] Environment management
- [ ] Database migration automation

## Phase 2 - Security & Compliance

### Security Enhancements
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] CORS configuration
- [ ] Security headers
- [ ] Vulnerability scanning

### Data Privacy
- [ ] GDPR compliance
- [ ] Data export functionality
- [ ] Data deletion (right to be forgotten)
- [ ] Privacy policy integration
- [ ] Cookie consent management

## Phase 2 - Deployment & Infrastructure

### Deployment Targets
- [ ] Vercel deployment configuration
- [ ] Docker containerization
- [ ] Railway deployment
- [ ] AWS deployment
- [ ] Multi-environment setup

### Infrastructure
- [ ] Database hosting (PlanetScale/Supabase)
- [ ] Redis for caching
- [ ] CDN setup
- [ ] Monitoring and alerting
- [ ] Backup strategies

## Future Considerations

### Mobile App
- [ ] React Native mobile app
- [ ] Push notifications
- [ ] Offline functionality
- [ ] App store deployment

### Advanced Features
- [ ] Real-time chat within communities
- [ ] Video conferencing integration
- [ ] Blockchain integration
- [ ] NFT community badges
- [ ] Decentralized identity

### Enterprise Features
- [ ] White-label solutions
- [ ] Custom domain support
- [ ] Advanced analytics
- [ ] API for third-party integrations
- [ ] Enterprise SSO

## Current Status

**Phase 1 (Current)**: Basic community platform with simulated payments
- ✅ User authentication (username-based)
- ✅ Optional Lightning Address and Nostr Pubkey support
- ✅ Community creation and management with real-time slug generation
- ✅ Public community pages
- ✅ Basic event and poll creation
- ✅ Internationalization (en/es)
- ✅ Responsive UI with shadcn/ui

**Phase 2 (Next)**: Enhanced features and real payments
- 🔄 Lightning payment integration
- 🔄 Advanced authentication
- 🔄 Enhanced community features
- 🔄 Media uploads
- 🔄 Analytics dashboard

**Phase 3 (Future)**: Mobile app and enterprise features
- 📋 Mobile application
- 📋 Advanced integrations
- 📋 Enterprise features
- 📋 Blockchain features
