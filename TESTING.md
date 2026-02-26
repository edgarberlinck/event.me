# Testing Guide

## ✅ Phase 1 Progress

### What's Complete:
- [x] Database setup with PostgreSQL (Docker)
- [x] Prisma schema with all models
- [x] NextAuth.js integration
- [x] Landing page
- [x] Login page with OAuth
- [x] Dashboard (basic)

### To Test:

1. **Start the infrastructure:**
   ```bash
   docker compose up -d
   npm run dev
   ```

2. **Access the app:**
   - Landing page: http://localhost:3000
   - Login page: http://localhost:3000/login
   - Dashboard: http://localhost:3000/dashboard (requires auth)

3. **Test authentication:**
   - ⚠️ **Note:** OAuth won't work yet because you need to configure:
     - Google OAuth credentials in Google Cloud Console
     - GitHub OAuth app in GitHub Settings
     - Update `.env` with the client IDs and secrets

### Setting Up OAuth (Required for Testing Auth):

#### Google OAuth:
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Go to "APIs & Services" > "Credentials"
4. Create "OAuth 2.0 Client ID"
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

#### GitHub OAuth:
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - Application name: Event.me (local)
   - Homepage URL: http://localhost:3000
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env`

### Environment Variables:
Your `.env` should look like:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:55002/eventme?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[already generated]"
GOOGLE_CLIENT_ID="your-actual-google-client-id"
GOOGLE_CLIENT_SECRET="your-actual-google-secret"
GITHUB_CLIENT_ID="your-actual-github-client-id"
GITHUB_CLIENT_SECRET="your-actual-github-secret"
```

### Current Features:
- ✅ Landing page with feature overview
- ✅ Login with Google/GitHub buttons
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
