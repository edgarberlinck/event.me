import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockDelete, mockInsert, mockPatch } = vi.hoisted(() => ({
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
}));

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

import { deleteGoogleCalendarEvent } from "@/lib/google-calendar";

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
