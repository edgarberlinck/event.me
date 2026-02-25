# Event.me 📅

A simple, no-nonsense scheduling application inspired by Calendly. Book meetings seamlessly based on available time slots.

## 🎯 Overview

Event.me is a straightforward scheduling tool that allows people to book meetings with you based on your available time slots. No complexity, no unnecessary features - just clean, efficient appointment scheduling.

## 🚀 Tech Stack

- **Frontend Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL
- **ORM:** Prisma 7
- **Validation:** Zod
- **Date Handling:** date-fns

## 📋 Development Plan

### Phase 1: Foundation & Database Setup
**Goal:** Set up the core infrastructure and database schema

- [x] Initialize Next.js project with TypeScript
- [x] Configure Tailwind CSS and shadcn/ui
- [x] Initialize Prisma with PostgreSQL
- [ ] Design and implement database schema:
  - User model (name, email, timezone)
  - Availability model (day of week, start time, end time)
  - Event Type model (title, duration, description)
  - Booking model (date, time, guest info, status)
- [ ] Create Prisma migrations
- [ ] Set up database connection and seed data

### Phase 2: Availability Management
**Goal:** Allow the host to configure their available time slots

- [ ] Create availability configuration page
- [ ] Implement CRUD operations for availability slots
- [ ] Add timezone selection
- [ ] Weekly schedule view with time blocks
- [ ] Validation for overlapping time slots
- [ ] Default availability settings

### Phase 3: Event Type Configuration
**Goal:** Define different types of meetings that can be booked

- [ ] Create event type management page
- [ ] Define event properties (duration, buffer time, description)
- [ ] Add custom booking questions
- [ ] Generate unique booking URLs per event type
- [ ] Event type list/grid view

### Phase 4: Booking Flow (Guest Side)
**Goal:** Enable guests to book available time slots

- [ ] Public booking page with calendar view
- [ ] Display available time slots based on:
  - Host's availability
  - Existing bookings
  - Event duration
  - Timezone conversion
- [ ] Date picker component (shadcn/ui Calendar)
- [ ] Time slot selection UI
- [ ] Guest information form
- [ ] Booking confirmation page
- [ ] Email validation

### Phase 5: Booking Management (Host Side)
**Goal:** Allow host to view and manage bookings

- [ ] Dashboard with upcoming bookings
- [ ] Calendar view of all bookings
- [ ] Booking details modal
- [ ] Cancel/Reschedule functionality
- [ ] Booking status management (confirmed, cancelled, completed)
- [ ] Filter and search bookings

### Phase 6: Notifications & Confirmations
**Goal:** Automated communication for bookings

- [ ] Email confirmation for new bookings (guest)
- [ ] Email notification for new bookings (host)
- [ ] Booking reminder emails (24h before)
- [ ] Cancellation notifications
- [ ] Email template system
- [ ] Consider integrating with service like Resend or SendGrid

### Phase 7: Polish & User Experience
**Goal:** Refine the user interface and experience

- [ ] Responsive design for mobile devices
- [ ] Loading states and optimistic UI updates
- [ ] Error handling and validation messages
- [ ] Empty states
- [ ] Success animations
- [ ] Dark mode support (optional)
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)

### Phase 8: Advanced Features (Optional)
**Goal:** Nice-to-have features for enhanced functionality

- [ ] Integration with Google Calendar / iCal
- [ ] Buffer time between meetings
- [ ] Minimum notice time for bookings
- [ ] Date range restrictions
- [ ] Custom branding (colors, logo)
- [ ] Multiple users/team scheduling
- [ ] Analytics dashboard
- [ ] Webhook support
- [ ] API endpoints for integrations

## 🗄️ Database Schema (Draft)

```prisma
model User {
  id            String          @id @default(cuid())
  name          String
  email         String          @unique
  timezone      String          @default("UTC")
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  availability  Availability[]
  eventTypes    EventType[]
  bookings      Booking[]
}

model Availability {
  id        String   @id @default(cuid())
  userId    String
  dayOfWeek Int      // 0-6 (Sunday to Saturday)
  startTime String   // "09:00"
  endTime   String   // "17:00"
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId])
}

model EventType {
  id          String    @id @default(cuid())
  userId      String
  title       String
  slug        String    @unique
  description String?
  duration    Int       // minutes
  color       String?
  active      Boolean   @default(true)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  bookings    Booking[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([userId])
  @@index([slug])
}

model Booking {
  id            String    @id @default(cuid())
  eventTypeId   String
  userId        String
  guestName     String
  guestEmail    String
  guestNotes    String?
  startTime     DateTime
  endTime       DateTime
  status        String    @default("confirmed") // confirmed, cancelled, completed
  eventType     EventType @relation(fields: [eventTypeId], references: [id], onDelete: Cascade)
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([userId])
  @@index([eventTypeId])
  @@index([startTime])
}
```

## 🏃 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone git@github.com:edgarberlinck/event.me.git
cd event.me
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy .env.example to .env and configure your database
cp .env .env.local
```

Update `prisma.config.ts` with your database URL.

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
event.me/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Host dashboard routes
│   ├── [username]/        # Public booking pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── booking/          # Booking-related components
│   └── availability/     # Availability components
├── lib/                   # Utility functions and configs
│   ├── prisma.ts         # Prisma client
│   ├── utils.ts          # Helper functions
│   └── validations/      # Zod schemas
├── prisma/
│   └── schema.prisma     # Database schema
└── public/               # Static assets
```

## 🎨 UI Components (shadcn/ui)

Key components to add:
- Calendar
- Button
- Input
- Form
- Card
- Dialog
- Select
- Badge
- Tabs
- Dropdown Menu

Install as needed:
```bash
npx shadcn@latest add calendar button input form card dialog select badge tabs dropdown-menu
```

## 🔧 Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open Prisma Studio
npx prisma migrate dev  # Run migrations
```

## 📝 License

MIT

## 👨‍💻 Author

Edgar Berlinck
