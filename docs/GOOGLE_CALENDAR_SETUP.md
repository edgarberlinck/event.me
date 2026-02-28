# Google Calendar Integration Setup

## Overview
This guide explains how to set up Google Calendar integration for Event.me. Users will be able to connect their Google Calendar to automatically sync bookings.

## Prerequisites
- A Google Cloud Console account
- Owner/Admin access to the Event.me application

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your Project ID for reference

## Step 2: Enable Google Calendar API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Calendar API"
3. Click on it and press **Enable**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type (unless you have a Google Workspace)
3. Fill in the required information:
   - **App name**: Event.me
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click **Save and Continue**
5. On **Scopes** page, click **Add or Remove Scopes**
6. Add these scopes:
   - `https://www.googleapis.com/auth/calendar.readonly` (Read calendar events)
   - `https://www.googleapis.com/auth/calendar.events` (Create/edit calendar events)
7. Click **Save and Continue**
8. Add test users (your email and any testers) if the app is in Testing mode
9. Click **Save and Continue**

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Choose **Web application**
4. Configure:
   - **Name**: Event.me Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)
5. Click **Create**
6. Copy the **Client ID** and **Client Secret** (you'll need these)

## Step 5: Configure Environment Variables

Add these variables to your `.env` file:

```bash
# Google OAuth
GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

Also update `.env.example` with placeholder values.

## Step 6: Verify Configuration

1. Restart your development server: `npm run dev`
2. Go to Settings page (logged in)
3. Click "Connect Google Calendar"
4. You should be redirected to Google's consent screen
5. Grant permissions
6. You should be redirected back with a success message

## User Flow

1. User logs into Event.me
2. User goes to Settings page
3. User clicks "Connect Google Calendar" button
4. User is redirected to Google OAuth consent screen
5. User grants calendar permissions
6. User is redirected back to Event.me
7. Access token is saved to database (Account model)
8. When a booking is created, Event.me creates a calendar event using the stored access token

## Token Refresh

Google OAuth tokens expire. The refresh token is stored in the database and used automatically by NextAuth to refresh access tokens when needed.

## Scopes Explanation

- `calendar.readonly`: Read user's calendar to check for conflicts
- `calendar.events`: Create and manage calendar events for bookings

## Security Notes

1. **Never commit** `.env` file to version control
2. Keep Client Secret secure
3. Use HTTPS in production
4. Regularly rotate secrets if compromised
5. Monitor OAuth token usage in Google Cloud Console

## Troubleshooting

### Error: redirect_uri_mismatch
- Ensure the redirect URI in Google Cloud Console exactly matches: `http://localhost:3000/api/auth/callback/google`
- No trailing slashes
- Protocol must match (http vs https)

### Error: access_denied
- User declined permissions
- Check if user is added as test user (in Testing mode)

### Token expired errors
- Refresh token should handle this automatically
- If persisting, user may need to reconnect their account

## Development vs Production

### Development
- Use `http://localhost:3000`
- Can use Testing mode in OAuth consent screen
- Limited to test users

### Production
- Use HTTPS only
- Must verify OAuth consent screen (submit for review)
- Available to all users

## Publishing the App (Optional)

To make your app available to all Google users:

1. Go to OAuth consent screen
2. Click "PUBLISH APP"
3. Submit for verification (required if using sensitive scopes)
4. Google will review your app (can take days/weeks)

For personal/internal use, Testing mode with specific test users is sufficient.
