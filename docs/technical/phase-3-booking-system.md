# Phase 3: Booking System

## Overview
Complete booking system allowing guests to book meetings through public pages and hosts to manage bookings.

## Features Implemented

### 1. Public Booking Page (`/book/[username]/[slug]`)
- Dynamic booking page for each event type
- Calendar UI for date selection  
- Real-time slot availability checking
- Guest information form
- Booking confirmation

### 2. Slot Availability Logic (`lib/slots.ts`)
**Functions:**
- `getAvailableSlots()` - Calculate available time slots for a given date
  - Checks user availability for day of week
  - Generates slots based on event duration
  - Filters out already booked slots
  - Returns only future slots

- `getBookableDates()` - Get all dates with available slots
  - Respects minimum notice hours
  - Respects maximum notice days
  - Only returns dates with actual availability

**Algorithm:**
1. Get user's availability for the selected day
2. Generate slots based on start/end times and duration
3. Check each slot against existing bookings
4. Filter for conflicts (overlapping times)
5. Return available slots

### 3. Booking API (`/api/bookings`)
**POST /api/bookings** - Create a new booking
- Validates required fields
- Checks minimum notice (hours before event)
- Checks maximum notice (days in advance)
- Prevents double booking (checks for conflicts)
- Enforces max bookings per week limit
- Returns 201 with booking data or error

**GET /api/bookings** - List all bookings
- Returns all bookings with event type and user info
- Ordered by start time (descending)

### 4. Slots API (`/api/slots`)
**GET /api/slots?eventTypeId=X&date=YYYY-MM-DD**
- Returns available time slots for a specific date
- Filters out past slots
- Checks existing bookings for conflicts

### 5. Booking Management Dashboard (`/dashboard/bookings`)
- List all bookings for the logged-in user
- Display booking details:
  - Event type
  - Guest name and email
  - Start time
  - Status (confirmed, cancelled, completed)
  - Guest notes
- Cancel bookings
- Status badges

### 6. Booking Status Update API (`/api/bookings/[id]`)
**PATCH /api/bookings/[id]** - Update booking status
- Validates ownership (only user's bookings)
- Allows status changes: confirmed, cancelled, completed
- Returns updated booking

## Booking Constraints

All constraints from Phase 2 Event Types are enforced:

1. **Minimum Notice Hours** - Bookings must be at least X hours in advance
2. **Maximum Notice Days** - Bookings cannot be more than X days in future
3. **Max Bookings Per Week** - Limit total bookings per calendar week
4. **Double Booking Prevention** - No overlapping time slots

## Components

### BookingForm (`components/booking-form.tsx`)
Client component for the booking flow:
- Calendar for date selection
- Fetches available slots via API
- Displays time slot buttons
- Guest information form
- Handles booking submission
- Toast notifications

### BookingsTable (`components/bookings-table.tsx`)
Client component for managing bookings:
- Lists all bookings
- Displays booking details
- Cancel functionality
- Status badges
- Empty state

## Navigation
Added "Bookings" link to dashboard navigation for easy access.

## Testing
Created E2E tests (`tests/booking-management.spec.ts`):
- Display bookings page
- Empty state when no bookings
- Display existing bookings
- Cancel bookings
- Verify status updates

## Dependencies Added
- `date-fns` - Date manipulation and formatting
- `date-fns-tz` - Timezone support

## URLs Structure
- `/book/[username]/[slug]` - Public booking page
- `/dashboard/bookings` - Booking management dashboard

## Security
- Public booking pages require no authentication
- Booking management requires authentication
- API endpoints validate ownership
- Cancel actions verify user owns the booking

## Future Enhancements
- Email notifications on booking creation/cancellation
- Calendar integration (Google Calendar, iCal)
- Timezone detection and display
- Booking reminders
- Custom booking fields
- Payment integration
