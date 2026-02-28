# Google Calendar Integration

## Overview

The Google Calendar integration allows Event.me to:
- Automatically create calendar events when bookings are made
- Generate Google Meet links for virtual meetings
- Check for calendar conflicts before accepting bookings
- Send calendar invites to guests automatically

## Setup Instructions

### 1. Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application"
   - Add authorized redirect URIs:
     - Development: `http://localhost:3000/api/auth/callback/google`
     - Production: `https://yourdomain.com/api/auth/callback/google`
   - Add authorized JavaScript origins:
     - Development: `http://localhost:3000`
     - Production: `https://yourdomain.com`

5. Configure OAuth consent screen:
   - Go to "APIs & Services" > "OAuth consent screen"
   - Select "External" (or "Internal" if using Google Workspace)
   - Add required scopes:
     - `openid`
     - `email`
     - `profile`
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/calendar.events`

6. Copy the Client ID and Client Secret to your `.env` file:
   ```bash
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

### 2. Connect Your Calendar

1. Log in to your Event.me account
2. Go to Dashboard > Integrations
3. Click "Connect" on the Google Calendar card
4. Authorize Event.me to access your Google Calendar
5. You'll be redirected back to the Integrations page with a "Connected" status

## How It Works

### Authentication Flow

1. User clicks "Connect" on the Integrations page
2. User is redirected to Google's OAuth consent screen
3. After authorization, Google redirects back with authorization code
4. NextAuth exchanges the code for access and refresh tokens
5. Tokens are securely stored in the database

### Token Management

- Access tokens are automatically refreshed when expired
- Refresh tokens are stored securely in the database
- Token refresh happens transparently during API calls

### Booking Flow with Calendar Integration

1. Guest selects a time slot and fills out booking form
2. System checks for calendar conflicts (if enabled)
3. If no conflicts, booking is created
4. Calendar event is automatically created with:
   - Event title
   - Guest information
   - Google Meet link
   - Reminders (24 hours before and 30 minutes before)
5. Calendar invite is sent to the guest
6. Google Meet link is included in the confirmation email

## API Functions

### `getGoogleCalendarClient(userId: string)`

Returns an authenticated Google Calendar client for the user.

**Throws:** Error if user hasn't connected Google Calendar

### `createGoogleCalendarEvent(userId, event)`

Creates a calendar event with Google Meet link.

**Parameters:**
- `userId`: User's ID
- `event`: Object with:
  - `summary`: Event title
  - `description`: Event description
  - `startTime`: Start date/time
  - `endTime`: End date/time
  - `attendees`: Array of attendee emails

**Returns:**
- `eventId`: Google Calendar event ID
- `meetLink`: Google Meet link
- `htmlLink`: Link to view event in Google Calendar

### `isGoogleCalendarConnected(userId: string)`

Checks if user has connected their Google Calendar.

**Returns:** Boolean

## Security Considerations

1. **Token Storage**: Access and refresh tokens are stored encrypted in the database
2. **Scopes**: Only request necessary calendar scopes
3. **Token Refresh**: Tokens are automatically refreshed, preventing unauthorized access
4. **User Control**: Users can disconnect their calendar at any time

## Troubleshooting

### "Google Calendar not connected" error

**Solution:** User needs to connect their Google Calendar in Settings > Integrations

### Token expired errors

**Solution:** The system should automatically refresh tokens. If errors persist, ask user to disconnect and reconnect.

### Meet link not generated

**Solution:** 
1. Ensure `conferenceDataVersion: 1` is set in the API call
2. Check that the OAuth consent screen includes Calendar scopes
3. Verify the user has Google Meet enabled on their account

### Calendar events not showing up

**Solution:**
1. Check that the event was successfully created (check returned `eventId`)
2. Verify the time zone settings
3. Ensure the user is looking at the correct calendar

## Future Enhancements

- Two-way sync (detect external calendar changes)
- Support for multiple calendars
- Conflict detection before showing available slots
- Calendar preference settings (working hours, buffer time)
- Support for other calendar providers (Outlook, Apple Calendar)
