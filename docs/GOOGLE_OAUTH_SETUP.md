# Google OAuth Setup Guide

This guide explains how to set up Google OAuth for Event.me to enable Google Calendar integration and Google Meet link generation.

## Overview

Event.me integrates with Google Calendar to:
- Automatically create calendar events when someone books with you
- Generate Google Meet links for video conferencing
- Send calendar invites to attendees
- Keep your calendar synchronized with bookings

## Prerequisites

- A Google Cloud Platform account
- Access to Google Cloud Console

## Setup Steps

### 1. Create OAuth Credentials in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

4. Configure OAuth consent screen:
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" user type
   - Fill in the required information:
     - App name: Event.me
     - User support email: your email
     - Developer contact: your email
   - Add scopes:
     - `openid`
     - `email`
     - `profile`
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/calendar.events`
   - Save and continue

5. Create OAuth 2.0 Client ID:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Add authorized redirect URIs:
     - Development: `http://localhost:3000/api/auth/callback/google`
     - Production: `https://your-domain.com/api/auth/callback/google`
   - Click "Create"
   - Copy the Client ID and Client Secret

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### 3. Connect Your Google Account

1. Start the development server: `npm run dev`
2. Navigate to Settings page in the dashboard
3. Click "Connect Google Calendar"
4. Authorize the application to access your Google Calendar
5. You'll be redirected back to the Settings page

## How It Works

### Authentication Flow

1. User clicks "Connect Google Calendar" button
2. NextAuth redirects to Google OAuth consent screen
3. User authorizes the application
4. Google redirects back with authorization code
5. NextAuth exchanges code for access token and refresh token
6. Tokens are stored in the database (Account table)

### Token Management

- Access tokens are short-lived (typically 1 hour)
- Refresh tokens are long-lived and used to obtain new access tokens
- The system automatically refreshes tokens when they expire
- Tokens are encrypted and stored securely in the database

### Calendar Event Creation

When a booking is made:

1. System retrieves user's Google access token
2. Creates a calendar event using Google Calendar API
3. Adds attendees (guest email)
4. Generates a Google Meet link automatically
5. Stores event ID and Meet link in booking record
6. Sends calendar invite to guest

### Required Scopes

- `openid`: User identity verification
- `email`: Access to user's email address
- `profile`: Access to basic profile information
- `https://www.googleapis.com/auth/calendar`: Read/write calendar access
- `https://www.googleapis.com/auth/calendar.events`: Create and manage events

## Security Considerations

- Never commit Google OAuth credentials to version control
- Use environment variables for sensitive data
- Keep `.env` file in `.gitignore`
- Use different OAuth clients for development and production
- Regularly rotate your OAuth client secrets
- Request only the minimum required scopes

## Troubleshooting

### "Google Calendar not connected" error
- Ensure you've connected your Google account in Settings
- Check that tokens are stored in the database
- Verify environment variables are set correctly

### Token refresh failures
- Check that refresh token is present in Account table
- Verify OAuth client credentials are valid
- Ensure user hasn't revoked access in Google account settings

### Calendar event creation fails
- Verify Google Calendar API is enabled
- Check that required scopes are granted
- Ensure access token is valid and not expired

## Testing

To test Google Calendar integration:

1. Connect your Google account in Settings
2. Create a test event type
3. Book a test meeting
4. Check your Google Calendar for the created event
5. Verify Google Meet link is generated

## Production Deployment

Before deploying to production:

1. Create a new OAuth client in Google Cloud Console
2. Add production redirect URI
3. Update environment variables in production
4. Complete OAuth consent screen verification (optional but recommended)
5. Test the full booking flow in production

## References

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
