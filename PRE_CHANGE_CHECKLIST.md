# Pre-Change Checklist for CommFlock
**Purpose:** Prevent cascading bugs and inconsistencies when implementing new features

**When to Use:** Before implementing ANY feature that touches authentication, database schema, API routes, or core business logic

---

## 🎯 General Impact Analysis

Before writing ANY code, answer these questions:

### 1. Data Flow Analysis
- [ ] What data does this feature read?
- [ ] What data does this feature write?
- [ ] What existing code reads/writes this same data?
- [ ] Are there any database migrations needed?

### 2. User Impact
- [ ] How does this affect NEW users?
- [ ] How does this affect EXISTING users?
- [ ] Is this a breaking change?
- [ ] What happens to old data?

### 3. System Dependencies
- [ ] What files will I need to modify?
- [ ] What files depend on what I'm changing?
- [ ] Are there any API contracts I'm breaking?
- [ ] Will this break any existing integrations?

---

## 🔐 Authentication Changes Checklist

Use this when changing: login, signup, sessions, user model, permissions

### Files to ALWAYS Check
- [ ] `src/lib/auth.ts` - Auth configuration
- [ ] `src/app/[locale]/(auth)/sign-in/page.tsx` - Sign-in UI
- [ ] `src/app/[locale]/(auth)/sign-up/page.tsx` - Sign-up UI
- [ ] `src/app/api/auth/**` - All auth API routes
- [ ] `prisma/schema.prisma` - User model
- [ ] `prisma/seed.ts` - Demo user creation
- [ ] All API routes that use `getServerSession()` or check auth

### Questions to Answer
- [ ] Does seed script create users compatible with new auth?
- [ ] Can existing users still sign in?
- [ ] Are passwords/tokens properly hashed?
- [ ] Are credentials logged anywhere? (They shouldn't be!)
- [ ] Is there rate limiting on auth endpoints?
- [ ] Is there a password reset flow if needed?
- [ ] Are error messages generic (not revealing system internals)?

### Testing Requirements
- [ ] Fresh install: new user signup → signin → access protected route
- [ ] Existing data: user created with old method can still sign in
- [ ] Invalid credentials: proper error handling
- [ ] Edge cases: empty password, SQL injection attempts, XSS attempts
- [ ] Demo user from seed can sign in

---

## 🗄️ Database Schema Changes Checklist

Use this when changing: Prisma schema, adding fields, changing relations

### Files to ALWAYS Check
- [ ] `prisma/schema.prisma` - The schema itself
- [ ] `prisma/seed.ts` - Seed data must match new schema
- [ ] `src/lib/validators.ts` - Zod schemas must match Prisma schema
- [ ] All API routes that query/mutate affected models
- [ ] All Server Components that query affected models
- [ ] Any TypeScript types that depend on Prisma types

### Questions to Answer
- [ ] Is the new field required or optional?
- [ ] What's the default value?
- [ ] How will existing rows be migrated?
- [ ] Can this migration be rolled back safely?
- [ ] Are there any unique constraints that could fail?
- [ ] Do indexes need to be added for performance?

### Migration Checklist
- [ ] Run migration locally first: `npm run db:migrate`
- [ ] Check generated SQL in `prisma/migrations/`
- [ ] Verify migration can run on production data (test with copy)
- [ ] Update seed script to include new fields
- [ ] Run seed to verify: `npm run db:reset && npm run seed`
- [ ] Update validation schemas in `validators.ts`
- [ ] Update API routes to handle new fields
- [ ] Test with fresh database
- [ ] Test with existing database (simulated)

---

## 🛣️ API Route Changes Checklist

Use this when changing: adding endpoints, modifying request/response format

### Files to ALWAYS Check
- [ ] The API route file itself
- [ ] `src/lib/validators.ts` - Input validation
- [ ] Any UI components that call this endpoint
- [ ] Any Server Components that duplicate this logic
- [ ] `claude.md` - API documentation section

### Questions to Answer
- [ ] What happens if required fields are missing?
- [ ] What happens if user is not authenticated?
- [ ] What happens if user doesn't have permission?
- [ ] What happens if database operation fails?
- [ ] Are there any race conditions?
- [ ] Is input validated and sanitized?
- [ ] Are errors logged appropriately?
- [ ] Are success cases logged (without sensitive data)?

### Security Checklist
- [ ] Input validated with Zod schema
- [ ] SQL injection prevented (using Prisma parameterized queries)
- [ ] XSS prevented (proper escaping, no `dangerouslySetInnerHTML`)
- [ ] CSRF protection (if needed)
- [ ] Authentication checked: `const session = await getServerSession()`
- [ ] Authorization checked: user owns resource or has permission
- [ ] Rate limiting applied (for sensitive endpoints)
- [ ] Errors don't reveal system internals

### Response Format
- [ ] Success: `{ data: {...} }` or relevant object
- [ ] Error: `{ error: "User-friendly message" }`
- [ ] No stack traces or internal errors exposed
- [ ] Consistent HTTP status codes (200, 400, 401, 403, 404, 500)

---

## 🌐 Internationalization (i18n) Changes Checklist

Use this when changing: routes, adding UI text, changing URL structure

### Files to ALWAYS Check
- [ ] `src/messages/en.json` - English translations
- [ ] `src/messages/es.json` - Spanish translations
- [ ] `src/middleware.ts` - Locale routing
- [ ] Any component using `useTranslations()` or `getTranslations()`
- [ ] Any `router.push()` calls (must include locale)

### Questions to Answer
- [ ] Are all new strings translated in BOTH languages?
- [ ] Do all route changes preserve locale prefix (`/en/*`, `/es/*`)?
- [ ] Does middleware handle new routes correctly?
- [ ] Are there any hardcoded URLs that need locale?
- [ ] Does the slug redirect logic still work?

### Common Mistakes
- ❌ `router.push('/discover')` → ✅ `router.push(\`/\${locale}/discover\`)`
- ❌ `<Link href="/about">` → ✅ `<Link href={\`/\${locale}/about\`}>`
- ❌ Adding text to `en.json` only → ✅ Add to BOTH `en.json` and `es.json`

---

## 🎨 UI Component Changes Checklist

Use this when changing: shared components, adding new components

### Files to ALWAYS Check
- [ ] The component itself
- [ ] Any pages that use this component
- [ ] `src/components/ui/*` if it's a shadcn component
- [ ] Tailwind classes (ensure they exist)
- [ ] TypeScript types (props interface)

### Questions to Answer
- [ ] Is the component accessible? (ARIA labels, keyboard navigation)
- [ ] Is the component responsive? (mobile, tablet, desktop)
- [ ] Does it support dark mode?
- [ ] Are animations performant?
- [ ] Are there any console errors/warnings?
- [ ] Is loading state handled?
- [ ] Is error state handled?

### Testing
- [ ] Render with empty data
- [ ] Render with typical data
- [ ] Render with extreme data (very long strings, many items)
- [ ] Test on mobile viewport
- [ ] Test with dark mode
- [ ] Test with slow network (loading states)

---

## 🚀 Deployment Changes Checklist

Use this when changing: env vars, build config, deployment settings

### Files to ALWAYS Check
- [ ] `.env` - Local environment variables
- [ ] `env.example` - Example for other developers
- [ ] `netlify.toml` - Netlify configuration
- [ ] `next.config.ts` - Next.js configuration
- [ ] `package.json` - Build scripts
- [ ] `README.md` - Setup documentation

### Questions to Answer
- [ ] Are all new env vars documented in `env.example`?
- [ ] Are env vars set in Netlify dashboard?
- [ ] Do migrations run before build? (they should)
- [ ] Is the build command correct?
- [ ] Are there any breaking changes to existing env vars?

### Pre-Deploy Checklist
- [ ] Run production build locally: `npm run build`
- [ ] Check for TypeScript errors: `npx tsc --noEmit`
- [ ] Check for lint errors: `npm run lint`
- [ ] Test production build: `npm run start`
- [ ] Verify all env vars are set in deployment platform
- [ ] Check database migrations are applied
- [ ] Monitor deployment logs for errors

---

## 🧪 Testing Checklist (General)

For ANY change, verify:

### Happy Path
- [ ] Feature works as expected with valid input
- [ ] Success messages/states display correctly
- [ ] Data persists correctly in database
- [ ] Navigation flows correctly

### Error Cases
- [ ] Invalid input shows appropriate error
- [ ] Network errors handled gracefully
- [ ] Database errors don't crash app
- [ ] 404s handled for missing resources
- [ ] 401/403s handled for auth failures

### Edge Cases
- [ ] Empty database (fresh install)
- [ ] Populated database (existing data)
- [ ] Missing optional fields
- [ ] Extremely long inputs
- [ ] Special characters (', ", <, >, &)
- [ ] Concurrent requests
- [ ] Slow network conditions

### Cross-Browser/Device
- [ ] Chrome (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop + iOS)
- [ ] Chrome (Android)
- [ ] Mobile viewport (responsive)

---

## 🤖 AI Assistant Prompting Guide

When asking AI (Claude, Cursor, etc.) to implement a feature:

### ❌ Bad Prompt
```
Add password authentication to the app
```

### ✅ Good Prompt
```
Add password authentication to CommFlock with the following requirements:

**Files to modify:**
1. src/lib/auth.ts - Update authorize() to check passwords
2. src/app/[locale]/(auth)/sign-up/page.tsx - Add password field
3. src/app/[locale]/(auth)/sign-in/page.tsx - Add password field
4. prisma/schema.prisma - Add hashedPassword field (nullable for backwards compat)
5. prisma/seed.ts - Update to create demo user with password
6. src/app/api/auth/signup/route.ts - Create new signup endpoint
7. src/lib/validators.ts - Add password validation schema

**Requirements:**
- Password must be hashed with bcrypt (12 rounds)
- Minimum 6 characters
- Existing users without passwords should still be able to sign in (backwards compatible)
- Demo user from seed must have a password
- No passwords in console logs
- Add rate limiting to prevent brute force
- Sign-in redirect must include locale prefix

**Before writing code:**
1. Read ALL the files listed above
2. Check if any other files depend on authentication
3. Verify the migration strategy for existing users
4. Confirm seed script compatibility

**After writing code:**
1. Verify demo user can sign in
2. Test with fresh database
3. Test error cases (wrong password, missing fields)
4. Check no passwords in logs
```

### Template for AI Prompts
```
Implement [FEATURE] with these requirements:

**Context:**
- Current behavior: [describe]
- Desired behavior: [describe]
- Breaking change: [yes/no, explain]

**Files to modify:**
[List specific files]

**Files to read first:**
[List dependencies to check]

**Edge cases to handle:**
- [Case 1]
- [Case 2]

**Testing checklist:**
- [ ] [Test case 1]
- [ ] [Test case 2]

**Before starting:**
1. Read all listed files
2. Identify what else depends on this
3. Explain your approach and what could break
4. Get approval before making changes
```

---

## 📝 Documentation Update Checklist

When making ANY change, update:

- [ ] `README.md` - If setup/usage changes
- [ ] `claude.md` - If architecture/patterns change
- [ ] API route documentation in `claude.md` - If endpoints change
- [ ] Database schema docs in `claude.md` - If models change
- [ ] `env.example` - If new env vars added
- [ ] Code comments - For complex logic
- [ ] Commit messages - Clear explanation of changes

---

## 🔄 Before Every PR/Commit

Final checklist before committing:

- [ ] All tests pass (when tests exist)
- [ ] Linter passes: `npm run lint`
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Build succeeds: `npm run build`
- [ ] Manually tested happy path
- [ ] Manually tested error cases
- [ ] No console.log debugging statements left
- [ ] No commented-out code
- [ ] Documentation updated
- [ ] Git commit message is clear
- [ ] Reviewed own diff for unintended changes

---

## 🚨 Red Flags (Stop and Rethink)

If you encounter any of these, STOP and reconsider your approach:

- 🚫 "I need to modify more than 10 files"
  - Feature might be too large, break it down

- 🚫 "I'm not sure what this code does"
  - Read and understand before modifying

- 🚫 "This will break existing users, but we can handle that later"
  - No! Handle it now or don't deploy

- 🚫 "I'll just make it required and existing data can use a default"
  - Verify this is safe, may need migration script

- 🚫 "The AI said to do it this way"
  - AI doesn't understand your full system, verify its suggestions

- 🚫 "It works on my machine"
  - Test in prod-like environment, with prod-like data

- 🚫 "I'll add tests later"
  - At minimum, manually test thoroughly before committing

---

## 📚 Additional Resources

- [Next.js Best Practices](https://nextjs.org/docs/getting-started/project-structure)
- [Prisma Migration Guide](https://www.prisma.io/docs/guides/migrate)
- [Auth.js Documentation](https://authjs.dev)
- [OWASP Security Cheat Sheet](https://cheatsheetseries.owasp.org/)

---

**Remember:** 15 minutes of planning prevents hours of debugging!
