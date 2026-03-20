import { describe, expect, it } from "vitest";
import { getAvailableSlots, getBookableDates } from "@/lib/slots";

// Minimal mock types matching Prisma shapes
const baseEventType = {
  id: "evt1",
  userId: "user1",
  title: "Test Event",
  slug: "test-event",
  description: null,
  duration: 60,
  color: null,
  active: true,
  maxBookingsPerWeek: null,
  minimumNoticeHours: 0,
  maximumNoticeDays: 30,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseAvailability = {
  id: "avail1",
  userId: "user1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("getAvailableSlots - timezone handling", () => {
  it("interprets availability times in the host timezone (Europe/Stockholm)", () => {
    // Monday availability: 20:00-22:00 in Stockholm time (CET = UTC+1)
    // Expected UTC slot start: 19:00 UTC (20:00 CET)
    // Use Date constructor with year/month/day args to create local midnight (consistent with parse())
    const monday = new Date(2024, 0, 15); // Monday, January 15 2024 at local midnight

    const eventType = {
      ...baseEventType,
      user: {
        timezone: "Europe/Stockholm",
        availability: [
          {
            ...baseAvailability,
            dayOfWeek: 1, // Monday
            startTime: "20:00",
            endTime: "22:00",
          },
        ],
      },
    };

    const slots = getAvailableSlots(monday, eventType, []);
    expect(slots.length).toBeGreaterThan(0);

    // In January, Stockholm is UTC+1 (CET), so 20:00 CET = 19:00 UTC
    const firstSlotStartHour = slots[0].start.getUTCHours();
    expect(firstSlotStartHour).toBe(19);
  });

  it("interprets availability times in UTC timezone", () => {
    // Monday availability: 09:00-11:00 in UTC
    const monday = new Date(2024, 0, 15); // Monday, January 15 2024 at local midnight

    const eventType = {
      ...baseEventType,
      user: {
        timezone: "UTC",
        availability: [
          {
            ...baseAvailability,
            dayOfWeek: 1, // Monday
            startTime: "09:00",
            endTime: "11:00",
          },
        ],
      },
    };

    const slots = getAvailableSlots(monday, eventType, []);
    expect(slots.length).toBeGreaterThan(0);

    // UTC timezone: 09:00 UTC = 09:00 UTC
    const firstSlotStartHour = slots[0].start.getUTCHours();
    expect(firstSlotStartHour).toBe(9);
  });

  it("interprets availability times in America/Sao_Paulo timezone", () => {
    // Monday availability: 09:00-11:00 in Sao Paulo time (BRT = UTC-3)
    // Expected UTC slot start: 12:00 UTC (09:00 BRT)
    const monday = new Date(2024, 0, 15); // Monday, January 15 2024 at local midnight

    const eventType = {
      ...baseEventType,
      user: {
        timezone: "America/Sao_Paulo",
        availability: [
          {
            ...baseAvailability,
            dayOfWeek: 1, // Monday
            startTime: "09:00",
            endTime: "11:00",
          },
        ],
      },
    };

    const slots = getAvailableSlots(monday, eventType, []);
    expect(slots.length).toBeGreaterThan(0);

    // In January, Sao Paulo is UTC-3, so 09:00 BRT = 12:00 UTC
    const firstSlotStartHour = slots[0].start.getUTCHours();
    expect(firstSlotStartHour).toBe(12);
  });

  it("returns empty array when no availability for the day", () => {
    const monday = new Date(2024, 0, 15); // Monday, January 15 2024 at local midnight

    const eventType = {
      ...baseEventType,
      user: {
        timezone: "Europe/Stockholm",
        availability: [
          {
            ...baseAvailability,
            dayOfWeek: 2, // Tuesday only
            startTime: "09:00",
            endTime: "11:00",
          },
        ],
      },
    };

    const slots = getAvailableSlots(monday, eventType, []);
    expect(slots).toHaveLength(0);
  });
});

describe("getAvailableSlots - cross-event-type availability clash", () => {
  const monday = new Date(2024, 0, 15); // Monday, January 15 2024

  const quickCallEventType = {
    ...baseEventType,
    id: "evt-quick-call",
    title: "Quick Call",
    slug: "quick-call",
    duration: 15,
    user: {
      timezone: "UTC",
      availability: [
        {
          ...baseAvailability,
          dayOfWeek: 1, // Monday
          startTime: "20:00",
          endTime: "22:00",
        },
      ],
    },
  };

  const oneOnOneEventType = {
    ...baseEventType,
    id: "evt-one-on-one",
    title: "1:1",
    slug: "one-on-one",
    duration: 60,
    user: {
      timezone: "UTC",
      availability: [
        {
          ...baseAvailability,
          dayOfWeek: 1, // Monday
          startTime: "20:00",
          endTime: "22:00",
        },
      ],
    },
  };

  const baseBooking = {
    id: "booking1",
    eventTypeId: "evt-quick-call",
    userId: "user1",
    guestName: "Guest",
    guestEmail: "guest@example.com",
    guestNotes: null,
    googleCalendarEventId: null,
    meetLink: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("blocks 1:1 at 20:00 when a quick call is already booked at 20:00", () => {
    // Quick call booked at 20:00-20:15 UTC
    const existingBookings = [
      {
        ...baseBooking,
        startTime: new Date("2024-01-15T20:00:00Z"),
        endTime: new Date("2024-01-15T20:15:00Z"),
        status: "confirmed",
      },
    ];

    const slots = getAvailableSlots(
      monday,
      oneOnOneEventType,
      existingBookings,
    );

    // 20:00 slot should be blocked because 20:00-21:00 overlaps with 20:00-20:15
    const twentyHourSlot = slots.find(
      (s) => s.start.getUTCHours() === 20 && s.start.getUTCMinutes() === 0,
    );
    expect(twentyHourSlot).toBeUndefined();
  });

  it("allows 1:1 at 21:00 after a quick call is booked at 20:00 (blocks 20:00-21:00 slot)", () => {
    // Quick call booked at 20:00-20:15 UTC
    // The 1:1 generates slots at 60-minute increments: 20:00 and 21:00
    // The 20:00-21:00 slot overlaps with the quick call, so only 21:00 is available
    const existingBookings = [
      {
        ...baseBooking,
        startTime: new Date("2024-01-15T20:00:00Z"),
        endTime: new Date("2024-01-15T20:15:00Z"),
        status: "confirmed",
      },
    ];

    const slots = getAvailableSlots(
      monday,
      oneOnOneEventType,
      existingBookings,
    );

    // 20:00 slot should be blocked (overlaps with the quick call)
    const twentyHourSlot = slots.find(
      (s) => s.start.getUTCHours() === 20 && s.start.getUTCMinutes() === 0,
    );
    expect(twentyHourSlot).toBeUndefined();

    // 21:00 slot should be available
    const twentyOneHourSlot = slots.find(
      (s) => s.start.getUTCHours() === 21 && s.start.getUTCMinutes() === 0,
    );
    expect(twentyOneHourSlot).toBeDefined();
  });

  it("blocks quick call slots that overlap with an existing 1:1 booking", () => {
    // 1:1 booked at 20:00-21:00 UTC
    const existingBookings = [
      {
        ...baseBooking,
        eventTypeId: "evt-one-on-one",
        startTime: new Date("2024-01-15T20:00:00Z"),
        endTime: new Date("2024-01-15T21:00:00Z"),
        status: "confirmed",
      },
    ];

    const slots = getAvailableSlots(
      monday,
      quickCallEventType,
      existingBookings,
    );

    // All 15-min slots within 20:00-21:00 should be blocked
    const slotsInBlockedRange = slots.filter(
      (s) => s.start.getUTCHours() === 20,
    );
    expect(slotsInBlockedRange).toHaveLength(0);

    // But 21:00 slot should be available
    const twentyOneHourSlot = slots.find(
      (s) => s.start.getUTCHours() === 21 && s.start.getUTCMinutes() === 0,
    );
    expect(twentyOneHourSlot).toBeDefined();
  });

  it("does not block slots when the conflicting booking is cancelled", () => {
    // Quick call cancelled at 20:00-20:15 UTC
    const existingBookings = [
      {
        ...baseBooking,
        startTime: new Date("2024-01-15T20:00:00Z"),
        endTime: new Date("2024-01-15T20:15:00Z"),
        status: "cancelled",
      },
    ];

    const slots = getAvailableSlots(
      monday,
      oneOnOneEventType,
      existingBookings,
    );

    // 20:00 slot should be available since the booking is cancelled
    const twentyHourSlot = slots.find(
      (s) => s.start.getUTCHours() === 20 && s.start.getUTCMinutes() === 0,
    );
    expect(twentyHourSlot).toBeDefined();
  });
});

describe("getBookableDates - minimum notice enforcement", () => {
  it("only returns dates where at least one slot meets the minimum notice requirement", () => {
    const allDayAvailability = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
      ...baseAvailability,
      id: `avail-${day}`,
      dayOfWeek: day,
      startTime: "09:00",
      endTime: "11:00",
    }));

    const eventType = {
      ...baseEventType,
      duration: 60,
      minimumNoticeHours: 24,
      maximumNoticeDays: 7,
      user: {
        timezone: "UTC",
        availability: allDayAvailability,
      },
    };

    const dates = getBookableDates(eventType, []);

    const now = new Date();
    const minNoticeTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Every bookable date must have at least one slot that meets the 24h notice requirement
    for (const date of dates) {
      const slots = getAvailableSlots(date, eventType, []);
      const validSlots = slots.filter((slot) => slot.start >= minNoticeTime);
      expect(validSlots.length).toBeGreaterThan(0);
    }
  });

  it("does not include dates where all slots fall inside the minimum notice window", () => {
    const allDayAvailability = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
      ...baseAvailability,
      id: `avail48-${day}`,
      dayOfWeek: day,
      startTime: "08:00",
      endTime: "10:00",
    }));

    const eventType = {
      ...baseEventType,
      duration: 60,
      minimumNoticeHours: 48,
      maximumNoticeDays: 14,
      user: {
        timezone: "UTC",
        availability: allDayAvailability,
      },
    };

    const dates = getBookableDates(eventType, []);

    const now = new Date();
    const minNoticeTime = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // Every bookable date must have at least one slot at or after minNoticeTime
    for (const date of dates) {
      const slots = getAvailableSlots(date, eventType, []);
      const validSlots = slots.filter((slot) => slot.start >= minNoticeTime);
      expect(validSlots.length).toBeGreaterThan(0);
    }
  });
});

describe("getAvailableSlots - Google Calendar busy times", () => {
  const monday = new Date(2024, 0, 15); // Monday, January 15 2024

  const eventType = {
    ...baseEventType,
    duration: 60,
    user: {
      timezone: "UTC",
      availability: [
        {
          ...baseAvailability,
          dayOfWeek: 1, // Monday
          startTime: "20:00",
          endTime: "22:00",
        },
      ],
    },
  };

  it("blocks a slot that overlaps with a Google Calendar busy interval", () => {
    const googleBusyTimes = [
      {
        start: new Date("2024-01-15T20:00:00Z"),
        end: new Date("2024-01-15T20:30:00Z"),
      },
    ];

    const slots = getAvailableSlots(monday, eventType, [], googleBusyTimes);

    // 20:00-21:00 slot overlaps with busy 20:00-20:30 → should be blocked
    const twentyHourSlot = slots.find(
      (s) => s.start.getUTCHours() === 20 && s.start.getUTCMinutes() === 0,
    );
    expect(twentyHourSlot).toBeUndefined();
  });

  it("keeps a slot that does not overlap with any Google Calendar busy interval", () => {
    const googleBusyTimes = [
      {
        start: new Date("2024-01-15T20:00:00Z"),
        end: new Date("2024-01-15T21:00:00Z"),
      },
    ];

    const slots = getAvailableSlots(monday, eventType, [], googleBusyTimes);

    // 21:00-22:00 slot has no overlap → should be available
    const twentyOneHourSlot = slots.find(
      (s) => s.start.getUTCHours() === 21 && s.start.getUTCMinutes() === 0,
    );
    expect(twentyOneHourSlot).toBeDefined();
  });

  it("blocks all slots when Google Calendar marks the entire window as busy", () => {
    const googleBusyTimes = [
      {
        start: new Date("2024-01-15T20:00:00Z"),
        end: new Date("2024-01-15T22:00:00Z"),
      },
    ];

    const slots = getAvailableSlots(monday, eventType, [], googleBusyTimes);

    expect(slots).toHaveLength(0);
  });

  it("returns all slots when google busy times list is empty", () => {
    const slots = getAvailableSlots(monday, eventType, [], []);

    expect(slots.length).toBeGreaterThan(0);
  });

  it("blocks a slot that is busy in Google Calendar even when it has no existing app bookings", () => {
    const googleBusyTimes = [
      {
        start: new Date("2024-01-15T21:00:00Z"),
        end: new Date("2024-01-15T22:00:00Z"),
      },
    ];

    const slots = getAvailableSlots(monday, eventType, [], googleBusyTimes);

    // 21:00-22:00 is busy in Google Calendar → blocked
    const twentyOneHourSlot = slots.find(
      (s) => s.start.getUTCHours() === 21 && s.start.getUTCMinutes() === 0,
    );
    expect(twentyOneHourSlot).toBeUndefined();

    // 20:00-21:00 is not busy → available
    const twentyHourSlot = slots.find(
      (s) => s.start.getUTCHours() === 20 && s.start.getUTCMinutes() === 0,
    );
    expect(twentyHourSlot).toBeDefined();
  });
});
