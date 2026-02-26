# Testing Guide

## E2E Testing with Playwright

The project uses **Playwright** for end-to-end testing. This provides reliable, browser-based tests that cover the full user flow.

### Test Structure

```
tests/
└── auth.spec.ts    # Complete authentication flow tests
```

### What's Covered

#### Authentication Flow (`tests/auth.spec.ts`)
- ✅ Landing page displays correctly
- ✅ Navigation to register page
- ✅ User registration with valid data
- ✅ Duplicate email rejection
- ✅ Login with valid credentials
- ✅ Login rejection with invalid password
- ✅ Login rejection with non-existent email
- ✅ Successful logout
- ✅ Protected routes (dashboard requires auth)
- ✅ Redirect logged-in users from login page

### Running Tests

Make sure the database is running:

```bash
docker compose up -d
```

Run all tests (Playwright will start the dev server automatically):

```bash
npm test                    # Run all tests headlessly
npm run test:ui             # Run with Playwright UI (recommended)
npm run test:headed         # Run with browser visible
npm run test:debug          # Run in debug mode
npm run test:codegen        # Generate tests with Codegen
```

### Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

### Browsers

Tests run on:
- Chromium (Chrome/Edge)
- Firefox
- WebKit (Safari)

### Writing New Tests

Use the Playwright test generator:

```bash
npm run test:codegen
```

This opens a browser where you can interact with your app, and Playwright will generate the test code.

## Unit Tests (Vitest)

Basic unit test structure exists for:
- Password hashing (`__tests__/lib/password.test.ts`)
- Toast notifications (`__tests__/components/auth-toast.test.tsx`)

**Note:** Vitest has dependency conflicts. Use Playwright for comprehensive testing.

## Manual Testing Checklist

Until automated tests are working, use this checklist:

### Authentication Flow
- [ ] Register with new email → Success
- [ ] Register with existing email → Error toast "Account already exists"
- [ ] Login with correct credentials → Redirect to dashboard
- [ ] Login with wrong password → Error toast "Invalid credentials"
- [ ] Login with non-existent email → Error toast "Invalid credentials"
- [ ] Logout from dashboard → Redirect to home

### Password Security
- [ ] Password must be at least 6 characters
- [ ] Password is hashed before storing (check in Prisma Studio)
- [ ] Same password generates different hashes each time

### Session Management
- [ ] Accessing /dashboard without login → Redirect to /login
- [ ] Accessing /login while logged in → Redirect to /dashboard
- [ ] Session persists across page refreshes
- [ ] Logout clears session

## Future Test Coverage

### Integration Tests (Recommended: Playwright)
- Complete auth flow E2E
- Form validation
- Navigation and redirects
- Toast notifications

### Unit Tests
- Server actions (handleLogin, handleRegister, handleSignOut)
- Middleware logic
- Database queries
- Utility functions

## Notes

The testing infrastructure is set up but needs:
1. Proper Vitest installation (currently has conflicts)
2. Mocking strategy for Next.js App Router server components
3. Database mocking or test database setup

Consider using **Playwright** for E2E tests instead of Vitest for better Next.js App Router support.
