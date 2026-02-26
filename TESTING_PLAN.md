# Testing Guide

## Current Status

The project has a basic testing setup configured with Vitest, but due to dependency resolution issues, tests are not yet fully operational.

## Test Structure

```
__tests__/
├── components/
│   └── auth-toast.test.tsx    # Tests for toast notifications
└── lib/
    └── password.test.ts       # Tests for password hashing with bcrypt
```

## What's Covered

### Password Hashing (`__tests__/lib/password.test.ts`)
- ✅ Password hashing with bcryptjs
- ✅ Password verification
- ✅ Rejecting incorrect passwords
- ✅ Generating unique hashes

### Authentication Toast (`__tests__/components/auth-toast.test.tsx`)
- ✅ Showing error toasts for invalid credentials
- ✅ Showing success toasts after registration

## Running Tests

Once dependencies are properly installed:

```bash
npm test              # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:coverage # Run with coverage report
```

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
