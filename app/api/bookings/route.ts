import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.server";
import { addHours, addDays, isAfter, isBefore } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventTypeId, guestName, guestEmail, guestNotes, startTime, endTime } = body;

    // Validate required fields
    if (!eventTypeId || !guestName || !guestEmail || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get event type
    const eventType = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
    });

    if (!eventType) {
      return NextResponse.json(
        { error: "Event type not found" },
        { status: 404 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    // Validate minimum notice
    const minNoticeTime = addHours(now, eventType.minimumNoticeHours);
    if (isBefore(start, minNoticeTime)) {
      return NextResponse.json(
        { error: `Booking must be at least ${eventType.minimumNoticeHours} hours in advance` },
        { status: 400 }
      );
    }

    // Validate maximum notice
    const maxNoticeTime = addDays(now, eventType.maximumNoticeDays);
    if (isAfter(start, maxNoticeTime)) {
      return NextResponse.json(
        { error: `Booking cannot be more than ${eventType.maximumNoticeDays} days in advance` },
        { status: 400 }
      );
    }

    // Check for conflicts
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        eventTypeId,
        status: {
          not: "cancelled",
        },
        OR: [
          {
            AND: [
              { startTime: { lte: start } },
              { endTime: { gt: start } },
            ],
          },
          {
            AND: [
              { startTime: { lt: end } },
              { endTime: { gte: end } },
            ],
          },
          {
            AND: [
              { startTime: { gte: start } },
              { endTime: { lte: end } },
            ],
          },
        ],
      },
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { error: "This time slot is no longer available" },
        { status: 409 }
      );
    }

    // Check max bookings per week if set
    if (eventType.maxBookingsPerWeek) {
      const weekStart = new Date(start);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekBookings = await prisma.booking.count({
        where: {
          eventTypeId,
          userId: eventType.userId,
          startTime: {
            gte: weekStart,
            lt: weekEnd,
          },
          status: {
            not: "cancelled",
          },
        },
      });

      if (weekBookings >= eventType.maxBookingsPerWeek) {
        return NextResponse.json(
          { error: "Maximum bookings for this week reached" },
          { status: 400 }
        );
      }
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        eventTypeId,
        userId: eventType.userId,
        guestName,
        guestEmail,
        guestNotes: guestNotes || null,
        startTime: start,
        endTime: end,
        status: "confirmed",
      },
      include: {
        eventType: true,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        eventType: true,
        user: true,
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
