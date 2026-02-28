import { google } from "googleapis";
import { prisma } from "./prisma.server";

export async function getGoogleCalendarClient(userId: string) {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "google",
    },
  });

  if (!account || !account.access_token) {
    throw new Error("Google Calendar not connected");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
  });

  // Handle token refresh
  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.refresh_token) {
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: tokens.expiry_date
            ? Math.floor(tokens.expiry_date / 1000)
            : null,
        },
      });
    } else if (tokens.access_token) {
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: tokens.access_token,
          expires_at: tokens.expiry_date
            ? Math.floor(tokens.expiry_date / 1000)
            : null,
        },
      });
    }
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

export async function createGoogleCalendarEvent(
  userId: string,
  event: {
    summary: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    attendees: string[];
    bookingId?: string;
  },
) {
  const calendar = await getGoogleCalendarClient(userId);

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const cancelUrl = event.bookingId
    ? `${baseUrl}/api/bookings/${event.bookingId}/cancel`
    : "";
  const rescheduleUrl = event.bookingId
    ? `${baseUrl}/booking/reschedule/${event.bookingId}`
    : "";

  const description = [
    event.description || "",
    "",
    "---",
    cancelUrl ? `Cancel this booking: ${cancelUrl}` : "",
    rescheduleUrl ? `Reschedule this booking: ${rescheduleUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const response = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    sendUpdates: "all",
    requestBody: {
      summary: event.summary,
      description,
      start: {
        dateTime: event.startTime.toISOString(),
      },
      end: {
        dateTime: event.endTime.toISOString(),
      },
      attendees: event.attendees.map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `${userId}-${Date.now()}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 30 },
        ],
      },
    },
  });

  return {
    eventId: response.data.id,
    meetLink: response.data.hangoutLink,
    htmlLink: response.data.htmlLink,
  };
}

export async function updateGoogleCalendarEvent(
  userId: string,
  eventId: string,
  updates: {
    summary?: string;
    description?: string;
    startTime?: Date;
    endTime?: Date;
    attendees?: string[];
  },
) {
  const calendar = await getGoogleCalendarClient(userId);

  const requestBody: Record<string, unknown> = {};

  if (updates.summary) requestBody.summary = updates.summary;
  if (updates.description) requestBody.description = updates.description;
  if (updates.startTime) {
    requestBody.start = { dateTime: updates.startTime.toISOString() };
  }
  if (updates.endTime) {
    requestBody.end = { dateTime: updates.endTime.toISOString() };
  }
  if (updates.attendees) {
    requestBody.attendees = updates.attendees.map((email) => ({ email }));
  }

  const response = await calendar.events.patch({
    calendarId: "primary",
    eventId,
    sendUpdates: "all",
    requestBody,
  });

  return {
    eventId: response.data.id,
    meetLink: response.data.hangoutLink,
    htmlLink: response.data.htmlLink,
  };
}

export async function deleteGoogleCalendarEvent(
  userId: string,
  eventId: string,
) {
  const calendar = await getGoogleCalendarClient(userId);

  await calendar.events.delete({
    calendarId: "primary",
    eventId,
    sendUpdates: "all",
  });
}

export async function isGoogleCalendarConnected(userId: string) {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "google",
    },
  });

  return !!account?.access_token;
}
