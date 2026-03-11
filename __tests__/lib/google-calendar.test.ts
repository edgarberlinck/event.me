import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockDelete, mockInsert, mockPatch, mockFreebusyQuery } = vi.hoisted(
  () => ({
    mockDelete: vi.fn().mockResolvedValue({}),
    mockInsert: vi.fn().mockResolvedValue({
      data: {
        id: "cal-event-1",
        hangoutLink: "https://meet.google.com/abc",
        htmlLink: "https://calendar.google.com/event?id=1",
      },
    }),
    mockPatch: vi.fn().mockResolvedValue({
      data: {
        id: "cal-event-1",
        hangoutLink: "https://meet.google.com/abc",
        htmlLink: "https://calendar.google.com/event?id=1",
      },
    }),
    mockFreebusyQuery: vi.fn().mockResolvedValue({
      data: {
        calendars: {
          primary: {
            busy: [
              {
                start: "2024-01-15T20:00:00Z",
                end: "2024-01-15T21:00:00Z",
              },
            ],
          },
        },
      },
    }),
  }),
);

vi.mock("googleapis", () => ({
  google: {
    auth: {
      OAuth2: class {
        setCredentials = vi.fn();
        on = vi.fn();
      },
    },
    calendar: vi.fn().mockReturnValue({
      events: {
        insert: mockInsert,
        patch: mockPatch,
        delete: mockDelete,
      },
      freebusy: {
        query: mockFreebusyQuery,
      },
    }),
  },
}));

vi.mock("@/lib/prisma.server", () => ({
  prisma: {
    account: {
      findFirst: vi.fn().mockResolvedValue({
        id: "account-1",
        userId: "user-1",
        provider: "google",
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
      }),
      update: vi.fn(),
    },
  },
}));

import {
  deleteGoogleCalendarEvent,
  getGoogleCalendarBusyTimes,
} from "@/lib/google-calendar";

describe("Google Calendar - deleteGoogleCalendarEvent", () => {
  beforeEach(() => {
    mockDelete.mockClear();
  });

  it("should call calendar.events.delete with the correct parameters", async () => {
    await deleteGoogleCalendarEvent("user-1", "cal-event-abc");

    expect(mockDelete).toHaveBeenCalledOnce();
    expect(mockDelete).toHaveBeenCalledWith({
      calendarId: "primary",
      eventId: "cal-event-abc",
      sendUpdates: "all",
    });
  });

  it("should not throw when the calendar API returns an error", async () => {
    mockDelete.mockRejectedValueOnce(new Error("Calendar API error"));

    await expect(
      deleteGoogleCalendarEvent("user-1", "cal-event-xyz"),
    ).rejects.toThrow("Calendar API error");
  });
});

describe("Google Calendar - getGoogleCalendarBusyTimes", () => {
  beforeEach(() => {
    mockFreebusyQuery.mockClear();
  });

  it("should return busy intervals from the freebusy API", async () => {
    const start = new Date("2024-01-15T00:00:00Z");
    const end = new Date("2024-01-16T00:00:00Z");

    const busyTimes = await getGoogleCalendarBusyTimes("user-1", start, end);

    expect(mockFreebusyQuery).toHaveBeenCalledOnce();
    expect(mockFreebusyQuery).toHaveBeenCalledWith({
      requestBody: {
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        items: [{ id: "primary" }],
      },
    });

    expect(busyTimes).toHaveLength(1);
    expect(busyTimes[0].start).toEqual(new Date("2024-01-15T20:00:00Z"));
    expect(busyTimes[0].end).toEqual(new Date("2024-01-15T21:00:00Z"));
  });

  it("should return an empty array when there are no busy intervals", async () => {
    mockFreebusyQuery.mockResolvedValueOnce({
      data: {
        calendars: {
          primary: { busy: [] },
        },
      },
    });

    const start = new Date("2024-01-15T00:00:00Z");
    const end = new Date("2024-01-16T00:00:00Z");

    const busyTimes = await getGoogleCalendarBusyTimes("user-1", start, end);

    expect(busyTimes).toHaveLength(0);
  });

  it("should return an empty array when the freebusy response has no calendars data", async () => {
    mockFreebusyQuery.mockResolvedValueOnce({
      data: { calendars: {} },
    });

    const start = new Date("2024-01-15T00:00:00Z");
    const end = new Date("2024-01-16T00:00:00Z");

    const busyTimes = await getGoogleCalendarBusyTimes("user-1", start, end);

    expect(busyTimes).toHaveLength(0);
  });
});
