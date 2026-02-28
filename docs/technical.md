# Technical Documentation

## Architecture Overview

Event.me is a scheduling application built using modern web technologies with a focus on simplicity and performance.

### Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **UI**: React with Tailwind CSS and shadcn/ui components
- **Testing**: Playwright for E2E tests

### Project Structure

```
event.me/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API endpoints
│   │   └── bookings/      # Booking creation endpoint
│   ├── dashboard/         # Protected dashboard pages
│   │   ├── availability/  # Availability management
│   │   └── event-types/   # Event type CRUD operations
│   ├── login/             # Authentication pages
│   ├── register/
│   └── [username]/[slug]/ # Public booking pages
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   └── booking-form.tsx  # Booking form component
├── lib/                   # Utility functions and configurations
│   ├── prisma.server.ts  # Prisma client configuration
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema and migrations
│   └── schema.prisma     # Database models
├── tests/                # End-to-end tests
└── docs/                 # Documentation
```

## Database Schema

### User
- Core user information
- Includes authentication credentials (hashed)
- Related to sessions, accounts, availability, event types, and bookings

### EventType
- Defines meeting types that users offer
- Contains title, slug, description, and duration
- Can be activated/deactivated
- **Booking Constraints**:
  - `maxBookingsPerWeek`: Optional limit on bookings per week (null = unlimited)
  - `minimumNoticeHours`: Minimum hours required before event start (default: 24)
  - `maximumNoticeDays`: Maximum days in advance for booking (default: 14)
- Users can have multiple event types

### Availability
- Defines when users are available for meetings
- Day of week and time range
- Users can have multiple availability slots

### Booking
- Represents scheduled meetings
- Links guest information with user and event type
- Tracks booking status (CONFIRMED, CANCELLED, etc.)
- Contains start/end times and guest details

## Key Features Implementation

### 1. Authentication System
**Location**: `app/login`, `app/register`, `auth.ts`

- Credentials-based authentication using bcryptjs
- Session management with NextAuth.js
- Protected routes using middleware
- User registration with email/username uniqueness validation

### 2. Event Types Management
**Location**: `app/dashboard/event-types/`

- CRUD operations for event types
- Each event type has:
  - Title and URL slug (unique)
  - Description
  - Duration (in minutes)
  - Active/inactive status
  - **Booking constraints**:
    - Max bookings per week (optional)
    - Minimum notice hours (prevents last-minute bookings)
    - Maximum notice days (limits how far ahead bookings can be made)
- Users can create multiple event types
- Constraints are validated server-side during booking creation

### 3. Availability Management
**Location**: `app/dashboard/availability/`

- Users define their available time slots
- Day-based scheduling (Monday-Sunday)
- Time range specification (start time - end time)
- Multiple slots per day supported
- Add/Delete operations

### 4. Public Booking System
**Location**: `app/[username]/[slug]/page.tsx`, `components/booking-form.tsx`

- Public-facing booking pages
- URL structure: `/{username}/{event-slug}`
- Features:
  - Calendar date selection
  - Time slot selection based on availability
  - Guest information form
  - Booking confirmation
- Conflict detection (prevents double-booking)

### 5. Booking API
**Location**: `app/api/bookings/route.ts`

- POST endpoint for creating bookings
- Validates:
  - Required fields
  - Time slot availability
  - Prevents overlapping bookings
- Returns booking confirmation

## API Endpoints

### POST /api/bookings
Creates a new booking.

**Request Body**:
```json
{
  "eventTypeId": "string",
  "userId": "string",
  "startTime": "ISO 8601 datetime",
  "endTime": "ISO 8601 datetime",
  "guestName": "string",
  "guestEmail": "string",
  "notes": "string (optional)"
}
```

**Validation**:
- Validates minimum notice hours (event must start at least X hours from now)
- Validates maximum notice days (event cannot be scheduled more than X days ahead)
- Validates max bookings per week (if limit is set for event type)
- Checks for conflicting bookings

**Responses**:
- 201: Booking created successfully
- 400: Missing required fields or validation errors
- 409: Time slot already booked
- 500: Internal server error

## Environment Variables

Required environment variables:

```env
DATABASE_URL=postgresql://user:password@host:port/database
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## Development Workflow

### Setup
```bash
# Install dependencies
npm install

# Start PostgreSQL (via Docker)
docker-compose up -d

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start dev server
npm run dev
```

### Testing
```bash
# Run E2E tests
npx playwright test

# Run specific test file
npx playwright test tests/booking.spec.ts

# Open test UI
npx playwright test --ui
```

### Database Management
```bash
# Create new migration
npx prisma migrate dev --name your_migration_name

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## Code Quality

### Pre-commit Hooks
- Biome linting and formatting
- Build verification
- Runs automatically before each commit

### CI/CD Pipeline
- GitHub Actions workflow
- Runs on every push and pull request
- Steps:
  1. Lint with Biome
  2. Build project
  3. Run E2E tests with Playwright

## Component Library

The application uses shadcn/ui components for a consistent UI:

- Button
- Input
- Label
- Card
- Calendar
- Badge
- Textarea
- Toast notifications (Sonner)

## Utility Functions

### Booking Validation (`lib/booking-validation.ts`)

Server-side validation helper for booking constraints:

```typescript
validateBooking(eventTypeId: string, startTime: Date): Promise<BookingValidationError[]>
```

**Validations performed**:
1. Event type exists and is active
2. Start time respects minimum notice hours
3. Start time is within maximum notice days
4. Max bookings per week limit not exceeded (if set)

Returns array of validation errors, empty if valid.

## Security Considerations

1. **Password Security**: Passwords are hashed using bcryptjs with salt rounds
2. **Protected Routes**: Middleware protects dashboard routes
3. **SQL Injection Prevention**: Prisma ORM handles query parameterization
4. **Session Security**: NextAuth.js manages secure session tokens
5. **Input Validation**: Server-side validation for all user inputs

## Performance Optimizations

1. **Server Components**: Most pages are React Server Components
2. **Client Components**: Only interactive parts use "use client"
3. **Database Indexing**: Prisma schema includes indexed fields
4. **Connection Pooling**: PostgreSQL connection pool via Prisma

## Future Improvements

1. Email notifications for bookings
2. Calendar integrations (Google Calendar, iCal)
3. Timezone support
4. Recurring availability patterns
5. Booking reminders
6. Payment integration
7. Video meeting links generation
8. Analytics dashboard
