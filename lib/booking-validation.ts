import { prisma } from "@/lib/prisma.server";

export interface BookingValidationError {
  field: string;
  message: string;
}

export async function validateBooking(
  eventTypeId: string,
  startTime: Date,
): Promise<BookingValidationError[]> {
  const errors: BookingValidationError[] = [];

  const eventType = await prisma.eventType.findUnique({
    where: { id: eventTypeId },
    include: { user: true },
  });

  if (!eventType) {
    errors.push({
      field: "eventType",
      message: "Event type not found",
    });
    return errors;
  }

  const now = new Date();

  // Check minimum notice
  const minimumNoticeMs = eventType.minimumNoticeHours * 60 * 60 * 1000;
  const timeDiff = startTime.getTime() - now.getTime();

  if (timeDiff < minimumNoticeMs) {
    errors.push({
      field: "startTime",
      message: `This event requires at least ${eventType.minimumNoticeHours} hours notice`,
    });
  }

  // Check maximum notice
  const maximumNoticeMs = eventType.maximumNoticeDays * 24 * 60 * 60 * 1000;

  if (timeDiff > maximumNoticeMs) {
    errors.push({
      field: "startTime",
      message: `This event can only be booked up to ${eventType.maximumNoticeDays} days in advance`,
    });
  }

  // Check max bookings per week
  if (eventType.maxBookingsPerWeek !== null) {
    const weekStart = new Date(startTime);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const bookingsThisWeek = await prisma.booking.count({
      where: {
        eventTypeId,
        startTime: {
          gte: weekStart,
          lt: weekEnd,
        },
        status: {
          in: ["confirmed"],
        },
      },
    });

    if (bookingsThisWeek >= eventType.maxBookingsPerWeek) {
      errors.push({
        field: "startTime",
        message: `Maximum bookings per week (${eventType.maxBookingsPerWeek}) reached for this event type`,
      });
    }
  }

  return errors;
}
