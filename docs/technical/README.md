# Event.me - Technical Documentation

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Tech Stack](#tech-stack)
3. [Database Schema](#database-schema)
4. [Authentication](#authentication)
5. [API Routes](#api-routes)
6. [Development Setup](#development-setup)
7. [Testing Strategy](#testing-strategy)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Deployment](#deployment)

---

## System Architecture

### Overview
Event.me is a meeting scheduling application built with Next.js 16, using server-side rendering and server actions for optimal performance and user experience.

### Architecture Layers

```
┌─────────────────────────────────────────┐
│         Client (Browser)                 │
│  - React Components (Server/Client)      │
│  - Form Actions                          │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│         Next.js App Router               │
│  - Server Components                     │
│  - Server Actions                        │
│  - API Routes (NextAuth)                 │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│         Business Logic Layer             │
│  - Auth (NextAuth v5)                    │
│  - Prisma ORM                            │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│         Data Layer                       │
│  - PostgreSQL 16                         │
│  - Prisma Adapter (pg)                   │
└─────────────────────────────────────────┘
```

### Key Design Decisions

1. **Server-First Architecture**: Leverages Next.js server components and actions to minimize client-side JavaScript
2. **Type Safety**: Full TypeScript coverage with Prisma generating types from database schema
3. **Security**: Credentials-based authentication with bcrypt password hashing
4. **Performance**: PostgreSQL connection pooling via Prisma adapter

---

## Tech Stack

### Core Framework
- **Next.js 16.1.6** (App Router with Turbopack)
- **React 19.2.3** (Server Components)
- **TypeScript 5.x**

### Database & ORM
- **PostgreSQL 16** (via Docker)
- **Prisma 7.4.1** (ORM with pg adapter)
- **@prisma/adapter-pg** (Connection pooling)

### Authentication
- **NextAuth v5.0.0-beta.30** (Credentials Provider)
- **bcryptjs 3.0.3** (Password hashing)

### UI Components
- **shadcn/ui** (Radix UI primitives)
- **Tailwind CSS 4** (Styling)
- **Lucide React** (Icons)

### Forms & Validation
- **React Hook Form 7.71.2**
- **Zod 4.3.6** (Schema validation)

### Testing
- **Playwright 1.58.2** (E2E tests)
- **Vitest 4.0.18** (Unit tests)

### Code Quality
- **Biome 2.4.4** (Linting & Formatting)
- **Husky 9.1.7** (Git hooks)

---

## Database Schema

### Overview
Prisma schema with 5 main models following NextAuth adapter conventions.

### Entity Relationship Diagram

```
User ──┬── Account (OAuth accounts)
       ├── Session (Active sessions)
       ├── Availability (Time slots)
       ├── EventType (Meeting types)
       └── Booking (as attendee or organizer)
```

### Models

#### User
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  username      String?   @unique
  timezone      String    @default("America/Sao_Paulo")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  accounts      Account[]
  sessions      Session[]
  availability  Availability[]
  eventTypes    EventType[]
  bookings      Booking[]
}
```

**Purpose**: Central user entity with profile and authentication data.

**Key Fields**:
- `timezone`: User's preferred timezone (default: São Paulo)
- `username`: Unique slug for booking URLs (e.g., /book/johndoe)
- `emailVerified`: Tracks email verification status

#### Availability
```prisma
model Availability {
  id        String   @id @default(cuid())
  userId    String
  dayOfWeek Int      // 0 = Sunday, 6 = Saturday
  startTime String   // HH:MM format
  endTime   String   // HH:MM format
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}
```

**Purpose**: Defines when users are available for meetings.

**Business Rules**:
- `dayOfWeek`: 0-6 (Sunday to Saturday)
- `startTime/endTime`: 24-hour format (e.g., "09:00", "17:30")
- Cascades on user deletion

#### EventType
```prisma
model EventType {
  id          String   @id @default(cuid())
  userId      String
  title       String
  slug        String
  description String?
  duration    Int      // Minutes
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  bookings Booking[]
  
  @@unique([userId, slug])
  @@index([userId])
}
```

**Purpose**: Different types of meetings users can offer.

**Examples**:
- 30-minute consultation
- 1-hour project planning
- 15-minute quick chat

#### Booking
```prisma
model Booking {
  id          String   @id @default(cuid())
  userId      String
  eventTypeId String
  startTime   DateTime
  endTime     DateTime
  attendeeName  String
  attendeeEmail String
  status      String   @default("pending") // pending, confirmed, cancelled
  createdAt   DateTime @default(now())
  
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  eventType EventType @relation(fields: [eventTypeId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([eventTypeId])
  @@index([startTime])
}
```

**Purpose**: Scheduled meetings between users and attendees.

**Status Flow**:
1. `pending` - Initial booking state
2. `confirmed` - User accepts
3. `cancelled` - Either party cancels

### Database Indexes

Optimized for common queries:
- User lookups: `email`, `username`
- Availability queries: `userId`, `dayOfWeek`
- Booking searches: `userId`, `eventTypeId`, `startTime`

---

## Authentication

### NextAuth v5 Configuration

**Provider**: Credentials (email + password)

**Flow**:
```
1. User submits email/password
2. Server action validates with Prisma
3. bcrypt compares password hash
4. NextAuth creates session
5. Cookie stored (httpOnly, secure)
```

### Implementation

**File**: `auth.ts`
```typescript
export const { auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" }
      },
      authorize: async (credentials) => {
        // Validation with Zod
        // Prisma user lookup
        // bcrypt comparison
        // Return user or null
      }
    })
  ]
})
```

### Session Management

- **Strategy**: JWT (stateless)
- **Storage**: HTTP-only cookies
- **Duration**: 30 days (configurable)
- **Refresh**: Automatic on activity

### Security Features

1. **Password Hashing**: bcrypt with salt rounds = 10
2. **CSRF Protection**: Built into NextAuth
3. **Session Validation**: Middleware protects routes
4. **SQL Injection**: Prevented by Prisma ORM

---

## API Routes

### NextAuth Routes

**Base**: `/api/auth/[...nextauth]`

- `POST /api/auth/callback/credentials` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Get session
- `GET /api/auth/csrf` - CSRF token

### Server Actions

#### Authentication
- `handleLogin(formData)` - Login user
- `handleRegister(formData)` - Create account
- `handleSignOut()` - Sign out user

#### User Management
- `getUserProfile(userId)` - Get user data
- `updateUserProfile(data)` - Update profile

---

## Development Setup

### Prerequisites

- Node.js 20.x
- Docker & Docker Compose
- npm/pnpm/yarn

### Installation

```bash
# Clone repository
git clone git@github.com:edgarberlinck/event.me.git
cd event.me

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your values

# Start PostgreSQL
docker-compose up -d

# Run migrations
npx prisma db push

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:55002/eventme"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
AUTH_URL="http://localhost:3000"
AUTH_SECRET="your-secret-here"
```

### Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Check code quality
npm run format       # Format code
npm test             # Run E2E tests
npm run test:ui      # Playwright UI mode
npm run db:studio    # Open Prisma Studio
```

---

## Testing Strategy

### E2E Tests (Playwright)

**Location**: `tests/auth.spec.ts`

**Coverage**:
- User registration flow
- Login/logout
- Protected routes
- Form validation
- Error handling

**Test Isolation**:
- Each test uses unique user email
- Database state reset between runs
- Parallel execution safe

### Unit Tests (Vitest)

**Location**: `__tests__/`

**Coverage**:
- Password hashing utilities
- Form validation schemas
- Component rendering

### Running Tests

```bash
# E2E tests
npm test                    # All tests
npm run test:headed        # With browser UI
npm run test:debug         # Debug mode

# Unit tests
npm run test:unit          # Vitest tests
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

**File**: `.github/workflows/ci.yml`

**Jobs**:
1. **Build** (runs first)
   - Install dependencies
   - Generate Prisma client
   - Run database migrations
   - Build Next.js app

2. **Lint** (parallel with E2E)
   - Run Biome checks
   - Verify code quality

3. **E2E** (parallel with Lint)
   - Install Playwright browsers
   - Run full test suite
   - Upload test reports

**Triggers**:
- Push to `main`
- Pull requests to `main`
- Manual dispatch

### Pre-commit Hooks

**File**: `.husky/pre-commit`

Currently minimal (checks run in CI):
```bash
echo "✓ Pre-commit checks passed (lint and build run in CI)"
```

---

## Deployment

### Recommended Platforms

1. **Vercel** (Recommended)
   - Zero-config Next.js deployment
   - Automatic previews for PRs
   - Built-in PostgreSQL via Vercel Postgres

2. **Railway**
   - PostgreSQL included
   - Simple deployment

3. **Self-hosted**
   - Docker Compose setup included
   - Requires PostgreSQL instance

### Environment Setup

**Required Variables**:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="generate-with-openssl"
NEXTAUTH_URL="https://your-domain.com"
AUTH_SECRET="same-as-nextauth-secret"
AUTH_URL="https://your-domain.com"
```

### Build Command

```bash
npm run build
```

### Start Command

```bash
npm start
```

### Database Migrations

```bash
npx prisma migrate deploy
```

---

## Performance Considerations

### Database
- Connection pooling via Prisma pg adapter
- Proper indexes on frequently queried fields
- Cascade deletes to maintain referential integrity

### Next.js
- Server components by default (reduced JS bundle)
- Dynamic imports for heavy components
- Image optimization with next/image

### Caching
- Static generation for public pages
- ISR for semi-dynamic content
- Database query caching (future enhancement)

---

## Security Checklist

- ✅ Password hashing with bcrypt
- ✅ CSRF protection (NextAuth)
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection (React sanitization)
- ✅ HTTP-only cookies
- ✅ Environment variable validation
- ✅ Protected API routes (middleware)
- ⏳ Rate limiting (future enhancement)
- ⏳ Email verification (future enhancement)

---

## Monitoring & Logging

### Current Setup
- Next.js built-in error handling
- Console logging in development

### Recommended Additions
- [ ] Sentry for error tracking
- [ ] Vercel Analytics for performance
- [ ] PostgreSQL slow query logs
- [ ] Custom logging service (Winston/Pino)

---

## Future Enhancements

### Phase 2: Core Features
- [ ] Availability management UI
- [ ] Event type creation
- [ ] Public booking pages
- [ ] Calendar integration (Google, Outlook)

### Phase 3: Advanced Features
- [ ] Email notifications (Resend/SendGrid)
- [ ] Time zone conversion
- [ ] Custom booking questions
- [ ] Payment integration (Stripe)

### Phase 4: Scale & Polish
- [ ] Multi-language support
- [ ] Team scheduling
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)

---

## Troubleshooting

### Common Issues

**Database Connection Errors**
```bash
# Check PostgreSQL is running
docker ps
# Restart if needed
docker-compose restart
```

**Prisma Client Not Found**
```bash
# Regenerate client
npx prisma generate
```

**Port Already in Use**
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Migration Errors**
```bash
# Reset database (CAUTION: deletes data)
npx prisma migrate reset
```

---

## Contributing

### Code Style
- Follow Biome configuration
- Use TypeScript strict mode
- Write meaningful commit messages
- Add tests for new features

### Pull Request Process
1. Fork repository
2. Create feature branch
3. Make changes with tests
4. Run `npm run lint` and `npm test`
5. Submit PR to `main`
6. Wait for CI to pass
7. Request review

---

## Support & Contact

**Repository**: https://github.com/edgarberlinck/event.me

**Issues**: https://github.com/edgarberlinck/event.me/issues

**Maintainer**: Edgar Muniz Berlinck
