# Google Calendar Integration

## Overview

Event.me integrates with Google Calendar to automatically create calendar events when bookings are made. This integration includes:

- Automatic event creation in the host's Google Calendar
- Google Meet links for virtual meetings
- Automatic email invitations to guests
- Calendar event synchronization

## Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Add authorized redirect URIs:
     - Development: `http://localhost:3000/api/auth/callback/google`
     - Production: `https://yourdomain.com/api/auth/callback/google`
5. Copy the Client ID and Client Secret

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
GOOGLE_CLIENT_ID="your-client-id-here"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

### 3. User Connection

Users must connect their Google Calendar:

1. Log in to Event.me
2. Go to Settings
3. Click "Connect Google Calendar"
4. Authorize the application with required permissions:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`

## Required Scopes

The integration requires the following Google OAuth scopes:

- `openid` - Basic authentication
- `email` - User email address
- `profile` - User profile information
- `https://www.googleapis.com/auth/calendar` - Full calendar access
- `https://www.googleapis.com/auth/calendar.events` - Event management

## Features

### Automatic Event Creation

When a booking is confirmed:

1. A calendar event is created in the host's primary Google Calendar
2. The guest is automatically added as an attendee
3. A Google Meet link is generated and attached
4. Both parties receive email invitations

### Event Details

The calendar event includes:

- **Title**: Event type name
- **Description**: Guest name and any notes provided
- **Time**: Selected booking slot
- **Attendees**: Guest email address
- **Conference**: Google Meet link
- **Reminders**: 
  - Email: 24 hours before
  - Popup: 30 minutes before

### Token Management

The integration handles OAuth token refresh automatically:

- Access tokens are stored in the database
- Refresh tokens enable long-term access
- Tokens are automatically refreshed when expired
- No user interaction needed for token renewal

## Error Handling

If Google Calendar integration fails:

- The booking is still created successfully
- Users are notified via email
- Error is logged for debugging
- System continues to function normally

This ensures bookings are never lost due to calendar integration issues.

## Privacy & Security

- Tokens are encrypted in the database
- Only necessary calendar permissions are requested
- Users can disconnect at any time
- Calendar access is per-user, not global

## Troubleshooting

### Calendar events not being created

1. Check if user has connected Google Calendar (Settings page)
2. Verify Google OAuth credentials are correct
3. Check application logs for errors
4. Ensure Google Calendar API is enabled in GCP

### "Invalid credentials" error

- OAuth credentials may be incorrect
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Verify redirect URIs match in Google Console

### Token refresh issues

- User may need to reconnect their calendar
- Check token expiry in database (`expires_at` field)
- Review Google OAuth consent screen settings

## API Reference

### `getGoogleCalendarClient(userId: string)`

Returns an authenticated Google Calendar API client for the user.

**Throws**: Error if user hasn't connected Google Calendar

### `createGoogleCalendarEvent(userId, event)`

Creates a calendar event with Google Meet link.

**Parameters**:
- `userId`: User ID
- `event`: Event details (summary, description, times, attendees)

**Returns**:
- `eventId`: Google Calendar event ID
- `meetLink`: Google Meet URL
- `htmlLink`: Calendar event URL

### `isGoogleCalendarConnected(userId: string)`

Checks if user has connected Google Calendar.

**Returns**: boolean
