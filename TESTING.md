# Testing Guide

## ✅ Phase 1 Progress

### What's Complete:
- [x] Database setup with PostgreSQL (Docker)
- [x] Prisma schema with all models
- [x] NextAuth.js with Credentials authentication
- [x] Landing page
- [x] Login page (email/password)
- [x] Registration page
- [x] Dashboard (basic)
- [x] Password hashing with bcryptjs

### To Test:

1. **Start the infrastructure:**
   ```bash
   docker compose up -d
   npm run dev
   ```

2. **Access the app:**
   - Landing page: http://localhost:3000
   - Register: http://localhost:3000/register
   - Login: http://localhost:3000/login
   - Dashboard: http://localhost:3000/dashboard (requires auth)

3. **Test authentication flow:**
   - Create a new account at `/register`
   - Sign in at `/login` with your credentials
   - Access the dashboard at `/dashboard`
   - Sign out from the dashboard

### Environment Variables:
Your `.env` should look like:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:55002/eventme?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[already generated]"
```

### Current Features:
- ✅ Landing page with feature overview
- ✅ User registration with password hashing
- ✅ Login with email/password
- ✅ Protected dashboard route
- ✅ User session display
- ✅ Sign out functionality
- ✅ Responsive design

### Next Steps (Phase 2):
- [ ] Availability management page
- [ ] Weekly schedule editor
- [ ] Time slot selection UI
- [ ] Timezone handling

## Database Access:
```bash
# View database in Prisma Studio
npm run db:studio

# Run migrations
npm run db:migrate

# Seed data
npm run db:seed
```

## Notes:
- Database is running on port 55002
- All data is persistent in Docker volume
- Middleware protects `/dashboard` routes
- JWT sessions (no database sessions for better performance)
