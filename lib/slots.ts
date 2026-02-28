import { addDays, addMinutes, startOfDay, format, parse, isAfter, isBefore, isWithinInterval } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import type { Availability, Booking, EventType } from "@prisma/client";

export interface TimeSlot {
  start: Date;
  end: Date;
}

export function getAvailableSlots(
  date: Date,
  eventType: EventType & { user: { availability: Availability[]; timezone: string } },
  existingBookings: Booking[]
): TimeSlot[] {
  const dayOfWeek = date.getDay();
  const timezone = eventType.user.timezone;

  // Find availability for this day
  const dayAvailability = eventType.user.availability.filter((a) => a.dayOfWeek === dayOfWeek);

  if (dayAvailability.length === 0) {
    return [];
  }

  const slots: TimeSlot[] = [];

  for (const availability of dayAvailability) {
    // Parse start and end times
    const [startHour, startMinute] = availability.startTime.split(":").map(Number);
    const [endHour, endMinute] = availability.endTime.split(":").map(Number);

    const start = new Date(date);
    start.setHours(startHour, startMinute, 0, 0);

    const end = new Date(date);
    end.setHours(endHour, endMinute, 0, 0);

    // Generate slots
    let currentSlot = start;
    while (isBefore(addMinutes(currentSlot, eventType.duration), end) || currentSlot.getTime() === end.getTime() - eventType.duration * 60000) {
      const slotEnd = addMinutes(currentSlot, eventType.duration);

      // Check if slot is available (not booked)
      const isBooked = existingBookings.some((booking) => {
        if (booking.status === "cancelled") return false;
        
        return (
          (isAfter(currentSlot, booking.startTime) || currentSlot.getTime() === booking.startTime.getTime()) &&
          isBefore(currentSlot, booking.endTime)
        ) || (
          isAfter(slotEnd, booking.startTime) &&
          (isBefore(slotEnd, booking.endTime) || slotEnd.getTime() === booking.endTime.getTime())
        ) || (
          (isBefore(currentSlot, booking.startTime) || currentSlot.getTime() === booking.startTime.getTime()) &&
          (isAfter(slotEnd, booking.endTime) || slotEnd.getTime() === booking.endTime.getTime())
        );
      });

      if (!isBooked) {
        slots.push({ start: new Date(currentSlot), end: new Date(slotEnd) });
      }

      currentSlot = addMinutes(currentSlot, eventType.duration);
    }
  }

  return slots;
}

export function getBookableDates(
  eventType: EventType & { user: { availability: Availability[]; timezone: string } },
  existingBookings: Booking[]
): Date[] {
  const dates: Date[] = [];
  const now = new Date();
  
  // Calculate min and max booking dates
  const minDate = addMinutes(now, eventType.minimumNoticeHours * 60);
  const maxDate = addDays(now, eventType.maximumNoticeDays);

  // Generate dates
  let currentDate = startOfDay(minDate);
  const endDate = startOfDay(maxDate);

  while (isBefore(currentDate, endDate) || currentDate.getTime() === endDate.getTime()) {
    const dayOfWeek = currentDate.getDay();
    
    // Check if there's availability for this day
    const hasAvailability = eventType.user.availability.some((a) => a.dayOfWeek === dayOfWeek);
    
    if (hasAvailability) {
      // Check if there are available slots
      const slots = getAvailableSlots(currentDate, eventType, existingBookings);
      const availableSlots = slots.filter(slot => isAfter(slot.start, now));
      
      if (availableSlots.length > 0) {
        dates.push(new Date(currentDate));
      }
    }

    currentDate = addDays(currentDate, 1);
  }

  return dates;
}
