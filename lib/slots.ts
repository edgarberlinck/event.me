import type { Availability, Booking, EventType } from "@prisma/client";
import {
  addDays,
  addMinutes,
  format,
  isAfter,
  isBefore,
  startOfDay,
} from "date-fns";
import { fromZonedTime } from "date-fns-tz";

export interface TimeSlot {
  start: Date;
  end: Date;
}

function hasTimeOverlap(
  slotStart: Date,
  slotEnd: Date,
  intervalStart: Date,
  intervalEnd: Date,
): boolean {
  return (
    ((isAfter(slotStart, intervalStart) ||
      slotStart.getTime() === intervalStart.getTime()) &&
      isBefore(slotStart, intervalEnd)) ||
    (isAfter(slotEnd, intervalStart) &&
      (isBefore(slotEnd, intervalEnd) ||
        slotEnd.getTime() === intervalEnd.getTime())) ||
    ((isBefore(slotStart, intervalStart) ||
      slotStart.getTime() === intervalStart.getTime()) &&
      (isAfter(slotEnd, intervalEnd) ||
        slotEnd.getTime() === intervalEnd.getTime()))
  );
}

export function getAvailableSlots(
  date: Date,
  eventType: EventType & {
    user: { availability: Availability[]; timezone: string };
  },
  existingBookings: Booking[],
  googleBusyTimes: TimeSlot[] = [],
): TimeSlot[] {
  const dayOfWeek = date.getDay();
  const timezone = eventType.user.timezone;

  // Find availability for this day
  const dayAvailability = eventType.user.availability.filter(
    (a) => a.dayOfWeek === dayOfWeek,
  );

  if (dayAvailability.length === 0) {
    return [];
  }

  const slots: TimeSlot[] = [];
  const dateStr = format(date, "yyyy-MM-dd");

  for (const availability of dayAvailability) {
    // Create start and end times interpreted in the host's timezone
    const start = fromZonedTime(
      `${dateStr}T${availability.startTime}:00`,
      timezone,
    );
    const end = fromZonedTime(
      `${dateStr}T${availability.endTime}:00`,
      timezone,
    );

    // Generate slots
    let currentSlot = start;
    while (
      isBefore(addMinutes(currentSlot, eventType.duration), end) ||
      currentSlot.getTime() === end.getTime() - eventType.duration * 60000
    ) {
      const slotEnd = addMinutes(currentSlot, eventType.duration);

      // Check if slot is available (not booked)
      const isBooked = existingBookings.some((booking) => {
        if (booking.status === "cancelled") return false;
        return hasTimeOverlap(
          currentSlot,
          slotEnd,
          booking.startTime,
          booking.endTime,
        );
      });

      if (!isBooked) {
        const isBusy = googleBusyTimes.some((busy) =>
          hasTimeOverlap(currentSlot, slotEnd, busy.start, busy.end),
        );

        if (!isBusy) {
          slots.push({ start: new Date(currentSlot), end: new Date(slotEnd) });
        }
      }

      currentSlot = addMinutes(currentSlot, eventType.duration);
    }
  }

  return slots;
}

export function getBookableDates(
  eventType: EventType & {
    user: { availability: Availability[]; timezone: string };
  },
  existingBookings: Booking[],
): Date[] {
  const dates: Date[] = [];
  const now = new Date();

  // Calculate min and max booking dates
  const minDate = addMinutes(now, eventType.minimumNoticeHours * 60);
  const maxDate = addDays(now, eventType.maximumNoticeDays);

  // Generate dates
  let currentDate = startOfDay(minDate);
  const endDate = startOfDay(maxDate);

  while (
    isBefore(currentDate, endDate) ||
    currentDate.getTime() === endDate.getTime()
  ) {
    const dayOfWeek = currentDate.getDay();

    // Check if there's availability for this day
    const hasAvailability = eventType.user.availability.some(
      (a) => a.dayOfWeek === dayOfWeek,
    );

    if (hasAvailability) {
      // Check if there are available slots
      const slots = getAvailableSlots(currentDate, eventType, existingBookings);
      const availableSlots = slots.filter(
        (slot) => !isBefore(slot.start, minDate),
      );

      if (availableSlots.length > 0) {
        dates.push(new Date(currentDate));
      }
    }

    currentDate = addDays(currentDate, 1);
  }

  return dates;
}
