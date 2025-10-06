# CommFlock - Agent Development Guide

This document describes how to use Cursor agents on this repository and the coding conventions we follow.

## Purpose

CommFlock is a community platform built with Next.js, Prisma, and Lightning payments. This guide helps agents understand the codebase structure and development practices.

## Coding Conventions

### TypeScript
- **Strict mode enabled**: Use proper typing, avoid `any`
- **Zod for validation**: All API inputs must be validated with Zod schemas
- **Prisma for database**: Use Prisma client for all database operations
- **Server components preferred**: Use server components unless interactivity is needed

### UI Guidelines
- **shadcn/ui components**: Use existing shadcn/ui components for consistency
- **Minimal styling**: Focus on functionality over custom styling
- **Accessibility first**: Ensure proper ARIA labels and keyboard navigation
- **Responsive design**: Mobile-first approach with Tailwind CSS

### Internationalization
- **All strings via next-intl**: Never hardcode strings, use translation keys
- **Keys in en/es**: Ensure all UI strings have corresponding keys in both language files
- **Consistent key structure**: Use dot notation (e.g., `nav.signIn`, `forms.username`)

### API Design
- **RESTful endpoints**: Follow REST conventions for API routes
- **Input validation**: Use Zod schemas for all request validation
- **Error handling**: Return consistent error responses
- **Status codes**: Use appropriate HTTP status codes

## File Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized routes
│   │   ├── (auth)/        # Authentication pages
│   │   ├── (public)/      # Public pages
│   │   └── [slug]/        # Community pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility libraries
│   ├── auth.ts          # Auth.js configuration
│   ├── db.ts            # Prisma client
│   ├── i18n.ts          # Internationalization
│   ├── validators.ts    # Zod schemas
│   └── slug.ts          # URL slug utilities
├── messages/            # i18n message files
│   ├── en.json
│   └── es.json
└── middleware.ts        # Next.js middleware
```

## Database Schema

Key models:
- **User**: Users with username, optional email, Lightning Address, and Nostr Pubkey
- **Community**: Multi-tenant communities with various settings
- **CommunityMember**: User memberships with roles and status
- **Event**: Community events with capacity and pricing
- **Poll**: Community polls with voting
- **Payment**: Simulated Lightning payments

## Authentication

- **Username and password**: Users sign up with username and password
- **Optional fields**: Email, Lightning Address, and Nostr Pubkey during registration
- **Session strategy**: JWT tokens
- **Protected routes**: Use middleware for route protection
- **Role-based access**: OWNER, ADMIN, MEMBER roles

## Payment System

- **Phase 1**: Simulated payments (PAID_SIMULATED status)
- **Phase 2**: Real Lightning payments via NWC
- **Cost structure**: 21 sats for community creation and events

## Commit Guidelines

Use conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `chore:` - Maintenance tasks
- `refactor:` - Code refactoring
- `docs:` - Documentation updates

## PR Checklist

Before submitting a pull request, ensure:
- [ ] TypeScript types are correct
- [ ] i18n keys are present for all strings
- [ ] Zod validations are in place
- [ ] Basic happy-path functionality is tested
- [ ] No console errors in browser
- [ ] Mobile responsiveness works

## Testing

- **Manual testing**: Test all user flows via UI
- **Unit tests**: Optional for now, focus on integration
- **Database**: Test with real database operations
- **Authentication**: Test both authenticated and unauthenticated flows

## Security Considerations

- **Dev-only auth**: Current authentication is development-only
- **Input validation**: All inputs validated with Zod
- **SQL injection**: Prisma prevents SQL injection
- **XSS**: React's built-in XSS protection
- **CSRF**: Next.js built-in CSRF protection

## Performance

- **Server components**: Use server components for better performance
- **Database queries**: Optimize Prisma queries with proper includes
- **Image optimization**: Use Next.js Image component
- **Bundle size**: Monitor bundle size with Next.js analyzer

## Recent Updates

- **Real-time Slug Generation**: Community creation now automatically generates slugs from names with user override capability
- **Enhanced User Registration**: Added optional Lightning Address and Nostr Pubkey fields with format validation
- **Form Validation**: Comprehensive client and server-side validation for new fields
- **Internationalization**: All new features support both English and Spanish
- **Database Integration**: Verified database schema properly handles new user fields

## Roadmap

See `docs/todo.md` for upcoming features and improvements.

## Getting Help

- Check existing issues and PRs
- Review the database schema in `prisma/schema.prisma`
- Test locally with `npm run dev`
- Use Prisma Studio to inspect database: `npm run prisma:studio`
