# Event.me

> **Simple, fast meeting scheduling—no hassle.**

Event.me is a lightweight alternative to Calendly. Share your availability, let others book directly. That's it.

# Live app

App is live and ready to use on [https://event-me-now.vercel.app](https://event-me-now.vercel.app)

---

## 🚀 Quick Start

```bash
# Clone repository
git clone git@github.com:edgarberlinck/event.me.git
cd event.me

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database URL and auth secrets

# Start PostgreSQL (Docker)
docker-compose up -d

# Run migrations
npx prisma db push

# Start development server
npm run dev
```

Visit: http://localhost:3000

---

## 📚 Documentation

### For Developers
**[Technical Documentation](docs/technical/README.md)**
- System architecture
- Database schema
- API routes
- Testing strategy
- Deployment guide
- [Google Calendar Integration](docs/technical/google-calendar-integration.md)
- [Resend Email Integration](docs/technical/resend-email-integration.md)

### For Business
**[Business Documentation](docs/business/README.md)**
- Product overview
- Value proposition
- Target audience
- Feature roadmap
- Go-to-market strategy

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript 5
- **Database**: PostgreSQL 16 + Prisma 7
- **Auth**: NextAuth v5 (Credentials + Google OAuth)
- **Integrations**: Google Calendar API (auto event creation + Meet links), Resend (email notifications)
- **UI**: Tailwind CSS 4 + shadcn/ui
- **Testing**: Playwright (E2E) + Vitest (Unit)
- **Code Quality**: Biome 2.4.4

---

## 📦 Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm start            # Start production server
npm run lint         # Check code quality (Biome)
npm run format       # Format code (Biome)
npm test             # Run E2E tests (Playwright)
npm run test:ui      # Playwright UI mode
npm run db:studio    # Open Prisma Studio
```

---

## 🎯 Current Status

**Phase 1: Authentication & Foundation** ✅
- User registration & login
- Protected dashboard
- Database schema
- CI/CD pipeline
- Pre-commit hooks (Biome)
- E2E tests passing

**Phase 2: Core Scheduling** ✅
- ✅ Availability management
- ✅ Event type creation with booking constraints
  - Max bookings per week
  - Minimum notice hours
  - Maximum notice days

**Phase 3: Booking System** ✅
- ✅ Public booking pages with calendar UI
- ✅ Real-time slot availability
- ✅ Booking creation with validation
- ✅ Booking management dashboard
- ✅ Cancel bookings
- ✅ Constraint enforcement
- ✅ Booking confirmation
- ✅ 32 E2E tests passing

**Phase 4: Google Calendar Integration** ✅
- ✅ Google OAuth authentication
- ✅ Automatic calendar event creation
- ✅ Google Meet link generation
- ✅ Guest invitations
- ✅ Token refresh handling

**Phase 5: Enhancements** 🚧
- ✅ Email notifications (booking confirmations, cancellations, reschedules via Resend)
- [ ] Advanced time zone support
- [ ] Payment integration
- [ ] Recurring availability

---

## 🧪 Testing

### E2E Tests (Playwright)
```bash
npm test                    # All tests
npm run test:headed        # With browser UI
npm run test:debug         # Debug mode
```

### Unit Tests (Vitest)
```bash
npm run test:unit          # Run unit tests
```

**Coverage**: 32 E2E tests covering:
- Authentication (register/login/logout)
- Availability management
- Event type CRUD with constraints
- Public booking flow
- Booking validation

---

## 🔐 Environment Variables

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:55002/eventme"

# Authentication (generate with: openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
AUTH_URL="http://localhost:3000"
AUTH_SECRET="your-secret-here"

# Google OAuth (for Calendar integration)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Resend (for email notifications)
RESEND_APIKEY="your-resend-api-key"
```

---

## 🚀 Deployment

### Recommended: Vercel

1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically on push

### Alternative: Docker

```bash
docker-compose up --build
```

Includes PostgreSQL + Next.js app.

---

## 📖 Project Structure

```
event.me/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── dashboard/         # Protected dashboard
│   └── api/               # API routes (NextAuth)
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities & database
│   ├── prisma.ts         # Prisma client
│   ├── resend.ts         # Email notifications (Resend)
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema & migrations
│   └── schema.prisma     # Data model
├── tests/                # E2E tests (Playwright)
├── docs/                 # Documentation
│   ├── technical/        # Technical docs
│   └── business/         # Business docs
└── .github/              # CI/CD workflows
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

**Before submitting**:
- Run `npm run lint` (must pass)
- Run `npm test` (all tests must pass)
- Update documentation if needed

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- **Next.js** - React framework
- **Prisma** - Database ORM
- **NextAuth** - Authentication
- **shadcn/ui** - UI components
- **Biome** - Fast linting & formatting
- **Resend** - Email delivery

---

## 📧 Contact

**Repository**: https://github.com/edgarberlinck/event.me

**Issues**: https://github.com/edgarberlinck/event.me/issues

**Maintainer**: Edgar Muniz Berlinck

---

**Built with ❤️ in Sweden 🇸🇪**
