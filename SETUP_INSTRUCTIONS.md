# Setup Instructions for Critical Features

## ✅ Completed: Critical Phase 1-5 Implementation

All 5 critical features have been implemented successfully!

---

## 🎉 What's Been Done

### 1. ✅ Testing Framework (Vitest + Playwright)
- **Vitest** for unit/integration tests
- **Playwright** for E2E testing
- Test helpers and database utilities
- Coverage reporting setup

**Test Files Created:**
- `tests/api/auth.test.ts` - Authentication API tests
- `tests/api/communities.test.ts` - Community API tests
- `tests/e2e/signup-flow.spec.ts` - Sign up E2E tests
- `tests/e2e/community-creation.spec.ts` - Community creation E2E tests

**Run Tests:**
```bash
npm test                  # Run unit tests
npm run test:ui           # Open Vitest UI
npm run test:coverage     # Generate coverage report
npm run test:e2e          # Run E2E tests
npm run test:e2e:ui       # Open Playwright UI
```

---

### 2. ✅ Password Reset Flow
- Email sending via Resend
- Secure token generation
- Token expiration (1 hour)
- One-time use tokens
- Bilingual emails (English/Spanish)

**New Routes:**
- `POST /api/auth/forgot-password` - Request reset
- `POST /api/auth/reset-password` - Reset with token
- `/[locale]/forgot-password` - Forgot password page
- `/[locale]/reset-password` - Reset password page

**Database:**
- New `PasswordResetToken` model added
- Migration applied automatically

---

### 3. ✅ Rate Limiting
- Upstash Redis integration
- 3 types of rate limits:
  - **Strict** (3/hour): Signup, forgot password
  - **Auth** (5/10min): Sign in, reset password
  - **API** (100/min): General endpoints

**Protected Endpoints:**
- `/api/auth/signup` - 3 attempts per hour
- `/api/auth/forgot-password` - 3 per hour
- `/api/auth/reset-password` - 5 per 10 minutes

---

### 4. ✅ CI/CD Pipeline
- GitHub Actions workflow
- Automated testing on PR
- Type checking
- Linting
- Build verification
- Automatic deployment to Netlify

**Pre-commit Hooks:**
- Husky + lint-staged configured
- Auto-format on commit
- Auto-lint TypeScript files

---

### 5. ✅ Sentry Error Monitoring
- Client-side error tracking
- Server-side error tracking
- Edge runtime support
- Sensitive data filtering (passwords, tokens)
- Production-only activation

---

## 🔧 Configuration Required

### 1. Upstash Redis (Rate Limiting)

**Sign up:** https://upstash.com/

1. Create a Redis database
2. Copy REST URL and token
3. Add to `.env`:
```env
UPSTASH_REDIS_REST_URL="https://xxxxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxxxxxxxxxxxx"
```

**Note:** Rate limiting works without Redis in dev (allows all requests with warning)

---

### 2. Resend (Email Sending)

**Sign up:** https://resend.com/

1. Create API key
2. Verify domain (for production)
3. Add to `.env`:
```env
RESEND_API_KEY="re_xxxxxxxxxxxxx"
```

**Test locally:**
```bash
# Send test password reset email
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@commflock.com"}'
```

---

### 3. Sentry (Error Monitoring)

**Sign up:** https://sentry.io/

1. Create new Next.js project
2. Copy DSN
3. Add to `.env`:
```env
NEXT_PUBLIC_SENTRY_DSN="https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"
```

**Note:** Sentry only active in production (NODE_ENV=production)

---

### 4. GitHub Actions (CI/CD)

**Setup:**

1. Go to GitHub repository settings
2. Add secrets:
   - `NETLIFY_AUTH_TOKEN` - From Netlify
   - `NETLIFY_SITE_ID` - From Netlify

**Triggers:**
- Push to `main` or `develop` branch
- Pull requests to `main`

**Jobs:**
- ✅ Lint check
- ✅ Type check
- ✅ Unit tests (with PostgreSQL)
- ✅ E2E tests
- ✅ Build verification
- ✅ Deploy to Netlify (main branch only)

---

## 📝 Environment Variables Checklist

Update your `.env` file with:

```env
# Required
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Phase 1-5 Features
RESEND_API_KEY="re_xxxxx"                    # Password reset emails
UPSTASH_REDIS_REST_URL="https://xxxxx"       # Rate limiting
UPSTASH_REDIS_REST_TOKEN="xxxxx"             # Rate limiting
NEXT_PUBLIC_SENTRY_DSN="https://xxxxx"       # Error monitoring
```

---

## 🧪 Testing the Implementation

### Test Password Reset Flow:
```bash
# 1. Start dev server
npm run dev

# 2. Go to sign-in page
open http://localhost:3000/en/sign-in

# 3. Click "Forgot password?"
# 4. Enter: demo@commflock.com
# 5. Check console for email (not actually sent in dev without Resend)
# 6. Copy reset token from logs
# 7. Visit: http://localhost:3000/en/reset-password?token=YOUR_TOKEN
# 8. Enter new password
```

### Test Rate Limiting:
```bash
# Try signing up 4 times quickly
for i in {1..4}; do
  curl -X POST http://localhost:3000/api/auth/signup \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"user$i\",\"password\":\"password123\"}"
  echo "\n---"
done

# 4th request should return 429 Too Many Requests
```

### Run All Tests:
```bash
# Unit tests
npm test

# E2E tests (requires built app)
npm run build
npm run test:e2e
```

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All environment variables set in Netlify
- [ ] Upstash Redis configured
- [ ] Resend API key configured
- [ ] Sentry DSN configured
- [ ] Database migrations applied
- [ ] Demo user seeded (or remove seed script)
- [ ] GitHub secrets configured
- [ ] All tests passing locally
- [ ] Build succeeds locally

**Deploy:**
```bash
# Commit all changes
git add .
git commit -m "Add Phase 1-5 critical features"

# Push to main (triggers CI/CD)
git push origin main
```

GitHub Actions will:
1. Run all tests
2. Build the application
3. Deploy to Netlify automatically

---

## 📊 Monitoring After Deployment

**Sentry Dashboard:**
- https://sentry.io/organizations/your-org/projects/

**Check for:**
- Error rates
- Performance issues
- Failed requests
- Rate limit hits

**Upstash Dashboard:**
- https://console.upstash.com/

**Check for:**
- Rate limit analytics
- Request patterns
- Blocked attempts

---

## 🐛 Troubleshooting

### Tests Failing?
```bash
# Clear caches and regenerate
rm -rf .next node_modules/.cache
npm run db:generate
npm run build
npm test
```

### Rate Limiting Not Working?
- Check UPSTASH_* env vars are set
- Redis allows all requests in dev if not configured
- Check console for rate limit warnings

### Emails Not Sending?
- Verify RESEND_API_KEY is set
- Check Resend dashboard for logs
- In dev, check console for email preview

### CI/CD Failing?
- Check GitHub Actions logs
- Verify all secrets are set
- Ensure database migrations are up to date

---

## 📚 Next Steps

Now that Phase 1-5 is complete, consider:

1. **Phase 2: Security Hardening**
   - CSRF protection
   - Authorization audit
   - Input sanitization

2. **Phase 3: Performance**
   - Database indexes
   - Caching strategy
   - Image optimization

3. **Phase 4: Features**
   - Notifications system
   - Image uploads
   - Search improvements

4. **Phase 5: Lightning Integration**
   - Real Lightning payments
   - NWC integration
   - Payment webhooks

See `PROJECT_ROADMAP.md` for full details!

---

## ✅ Verification Commands

Run these to verify everything works:

```bash
# 1. Tests pass
npm test

# 2. Build succeeds
npm run build

# 3. Lint passes
npm run lint

# 4. Type check passes
npx tsc --noEmit

# 5. E2E tests pass
npm run test:e2e

# 6. Pre-commit hook works
git add .
git commit -m "test"  # Should auto-format and lint
```

---

**🎉 Congratulations! Phase 1-5 is complete and production-ready!**
