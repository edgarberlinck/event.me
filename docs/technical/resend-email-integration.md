# Resend Email Integration

Event.me uses [Resend](https://resend.com) to send transactional email notifications for booking events.

---

## Overview

When users schedule, cancel, or reschedule meetings, the host receives an automated email notification. This keeps hosts informed without requiring them to manually check their dashboard.

---

## Setup

### 1. Create a Resend Account

Sign up at [https://resend.com](https://resend.com).

### 2. Obtain an API Key

In the Resend dashboard, navigate to **API Keys** and create a new key with send permissions.

### 3. Configure the Environment Variable

Add the API key to your `.env` file:

```env
RESEND_APIKEY="your-resend-api-key"
```

> **Note**: If `RESEND_APIKEY` is not set, the Resend client will be initialized without a key and email sends will fail silently (errors are not surfaced to the end user).

---

## Sent Emails

All emails are sent from `onboarding@resend.dev` (Resend's shared testing domain). To send from your own domain, verify it in the Resend dashboard and update `EMAIL_FROM` in `lib/resend.ts`.

### Booking Created

**Trigger**: A guest successfully books a time slot via the public booking page.

**Recipient**: The host (event owner).

**Subject**: `New Booking: <event title> with <guest name>`

**Content**:
- Event title
- Guest name and email
- Start and end time
- Guest notes (if provided)
- Google Meet link (if Google Calendar integration is active)

### Booking Cancelled

**Trigger**: The host cancels a booking from their dashboard.

**Recipient**: The host.

**Subject**: `Booking Cancelled: <event title> with <guest name>`

**Content**:
- Event title
- Guest name and email
- Original start and end time

### Booking Rescheduled

**Trigger**: A booking is rescheduled to a new time slot.

**Recipient**: The host.

**Subject**: `Booking Rescheduled: <event title> with <guest name>`

**Content**:
- Event title
- Guest name and email
- Previous time slot
- New start and end time
- Google Meet link (if applicable)

### Booking Status Changed

**Trigger**: A booking's status is updated (e.g., `pending` → `confirmed`).

**Recipient**: The host.

**Subject**: `Booking <Status>: <event title> with <guest name>`

**Content**:
- Event title
- Guest name and email
- Start and end time
- New status

---

## Implementation

The email logic lives in `lib/resend.ts` and exports four functions:

```typescript
sendBookingCreatedEmail(params: BookingEmailParams): Promise<void>
sendBookingCancelledEmail(params: BookingEmailParams): Promise<void>
sendBookingRescheduledEmail(params: BookingEmailParams & { previousStartTime: Date; previousEndTime: Date }): Promise<void>
sendBookingStatusChangedEmail(params: BookingEmailParams & { status: string }): Promise<void>
```

These are called from the booking API routes:

| Route | Function called |
|-------|----------------|
| `POST /api/bookings` | `sendBookingCreatedEmail` |
| `DELETE /api/bookings/[id]` or `PATCH /api/bookings/[id]` (cancel) | `sendBookingCancelledEmail` |
| `POST /api/bookings/[id]/reschedule` | `sendBookingRescheduledEmail` |
| `PATCH /api/bookings/[id]` (status change) | `sendBookingStatusChangedEmail` |

### HTML Sanitization

All user-supplied content (event title, guest name, notes, etc.) is HTML-escaped before being embedded in email bodies using the `escapeHtml` helper in `lib/resend.ts`. This prevents XSS via email content.

---

## Testing

Unit tests for the email functions are located in `__tests__/lib/resend.test.ts`. They mock the Resend SDK and verify that the correct `from`, `to`, `subject`, and `html` values are passed for each scenario.

```bash
npm run test:unit
```

---

## Troubleshooting

**Emails not being sent**

- Check that `RESEND_APIKEY` is set correctly in your `.env` file.
- Verify the API key has send permissions in the Resend dashboard.
- Check server logs for errors from the Resend client.

**Emails going to spam**

- Verify your sending domain in the Resend dashboard.
- Update `EMAIL_FROM` in `lib/resend.ts` to use your verified domain (e.g., `notifications@yourdomain.com`).

---

## Related Documentation

- [Technical README](README.md)
- [Google Calendar Integration](google-calendar-integration.md)
- [Booking System](phase-3-booking-system.md)
