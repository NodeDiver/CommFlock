# CommFlock

CommFlock is a community/groups platform where users sign in with a username (email optional), discover or create communities, and coordinate activities. Communities can be public or private, auto-join or approval-required. Each community has announcements, activity, events with capacity control, simple votes, a leaderboard, and owner-defined badges. Payments are Lightning-first via NWC (phase 2); in phase 1 we simulate payments so flows are testable. Multi-tenant by slug (e.g., project.com/gordosbala). i18n en/es from day one. Built with Next.js (App Router), Prisma/Postgres, Auth.js, and shadcn/ui.

## Features

- **Multi-tenant Communities**: Each community has its own space with custom settings and policies
- **Lightning Payments**: Built-in Lightning Network support for community creation and event payments (simulated in v1)
- **Events & Polls**: Coordinate activities with events, polls, and community announcements
- **Flexible Join Policies**: Auto-join, approval-required, or closed communities
- **Member Management**: Points, badges, and leaderboards
- **Internationalization**: English and Spanish support
- **Modern UI**: Built with shadcn/ui and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Auth.js with credentials provider
- **UI**: Tailwind CSS + shadcn/ui
- **Internationalization**: next-intl
- **Validation**: Zod
- **Forms**: react-hook-form

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+ (for local development)
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CommFlock
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

Edit `.env` with your database credentials:

**For open source contributors (SQLite):**
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-change-later"
```

**For shared development (Neon PostgreSQL):**
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST-POOLER.neon.tech/DB?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DB?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-change-later"
```

4. Set up the database:
```bash
# Run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed the database (optional)
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploying to Netlify + Neon

### Prerequisites for Deployment

- [Neon](https://neon.tech/) account (free tier available)
- [Netlify](https://netlify.com/) account (free tier available)

### 1. Set up Neon Database

1. Create a new project in [Neon Console](https://console.neon.tech/)
2. Copy your connection strings:
   - **Pooled URL** (for runtime): `postgresql://USER:PASSWORD@HOST-POOLER.neon.tech/DB?sslmode=require&pgbouncer=true`
   - **Direct URL** (for migrations): `postgresql://USER:PASSWORD@HOST.neon.tech/DB?sslmode=require`

### 2. Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard:
   ```
   DATABASE_URL=postgresql://USER:PASSWORD@HOST-POOLER.neon.tech/DB?sslmode=require&pgbouncer=true
   DIRECT_URL=postgresql://USER:PASSWORD@HOST.neon.tech/DB?sslmode=require
   NEXTAUTH_URL=https://your-site.netlify.app
   NEXTAUTH_SECRET=your-secret-key-here
   ```
3. Deploy! Netlify will automatically:
   - Run `prisma migrate deploy`
   - Generate Prisma client
   - Build the Next.js app
   - Deploy using OpenNext

### 3. Post-Deployment

1. **Health Check**: Visit `https://your-site.netlify.app/api/health`
2. **Database Test**: Create a test community
3. **Authentication**: Test sign-in functionality
4. **i18n**: Verify language switching works

### Smoke Test Checklist

- [ ] Health endpoint returns 200
- [ ] Database connection successful
- [ ] Home page loads correctly
- [ ] Language switching works (/en ↔ /es)
- [ ] Community creation works
- [ ] Authentication flow works
- [ ] Images load properly
- [ ] API routes respond correctly

## Project Structure

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

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:studio` - Open Prisma Studio
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run seed` - Seed the database

### Database

The project uses Prisma as the ORM with PostgreSQL. Database schema is defined in `prisma/schema.prisma`.

Key models:
- **User**: Users with username and optional email
- **Community**: Multi-tenant communities with various settings
- **CommunityMember**: User memberships with roles and status
- **Event**: Community events with capacity and pricing
- **Poll**: Community polls with voting
- **Payment**: Simulated Lightning payments

### Authentication

Currently uses a simple credentials provider for development:
- Username (required)
- Email (optional)
- No passwords in v1

### Internationalization

The app supports English and Spanish with next-intl:
- Default locale: Spanish (es)
- URL structure: `/en/...` or `/es/...`
- Message files in `src/messages/`

## Phase 2 Roadmap

- Real Lightning payments via NWC
- Additional authentication providers (Google, GitHub, Nostr)
- Email/push notifications
- Media uploads for community covers
- Moderation tools
- Metrics dashboard
- E2E tests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details