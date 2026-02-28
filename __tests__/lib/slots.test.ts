import { describe, expect, it } from "vitest";
import { getAvailableSlots } from "@/lib/slots";

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
