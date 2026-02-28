import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventTypeId, userId, startTime, endTime, guestName, guestEmail, notes } = body;

    if (!eventTypeId || !userId || !startTime || !endTime || !guestName || !guestEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if time slot is already booked
    const existingBooking = await prisma.booking.findFirst({
      where: {
        userId,
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime) } },
            ],
          },
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } },
            ],
          },
        ],
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "This time slot is already booked" },
        { status: 409 }
      );
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        eventTypeId,
        userId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        guestName,
        guestEmail,
        guestNotes: notes,
        status: "confirmed",
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
