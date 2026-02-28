import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.server";
import { getAvailableSlots } from "@/lib/slots";
import { parse, startOfDay } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventTypeId = searchParams.get("eventTypeId");
    const dateStr = searchParams.get("date");

    if (!eventTypeId || !dateStr) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get event type with user availability
    const eventType = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
      include: {
        user: {
          include: {
            availability: true,
          },
        },
      },
    });

    if (!eventType) {
      return NextResponse.json(
        { error: "Event type not found" },
        { status: 404 }
      );
    }

    // Parse date
    const date = parse(dateStr, "yyyy-MM-dd", new Date());

    // Get existing bookings for this event type on this date
    const startOfDate = startOfDay(date);
    const endOfDate = new Date(startOfDate);
    endOfDate.setDate(endOfDate.getDate() + 1);

    const existingBookings = await prisma.booking.findMany({
      where: {
        eventTypeId: eventType.id,
        startTime: {
          gte: startOfDate,
          lt: endOfDate,
        },
        status: {
          not: "cancelled",
        },
      },
    });

    // Calculate available slots
    const slots = getAvailableSlots(date, eventType, existingBookings);

    // Filter slots that are in the future
    const now = new Date();
    const futureSlots = slots.filter((slot) => slot.start > now);

    return NextResponse.json({
      slots: futureSlots.map((slot) => ({
        start: slot.start.toISOString(),
        end: slot.end.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Slots API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
