import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.server";
import { getGoogleCalendarClient } from "@/lib/google-calendar";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        eventType: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 },
      );
    }

    if (booking.status === "cancelled") {
      return NextResponse.json(
        { error: "Booking already cancelled" },
        { status: 400 },
      );
    }

    // Cancel Google Calendar event
    if (booking.googleCalendarEventId) {
      try {
        const calendar = await getGoogleCalendarClient(booking.userId);
        await calendar.events.delete({
          calendarId: "primary",
          eventId: booking.googleCalendarEventId,
          sendUpdates: "all",
        });
      } catch (error) {
        console.error("Failed to delete Google Calendar event:", error);
      }
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: "cancelled" },
    });

    return NextResponse.json({
      message: "Booking cancelled successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 },
    );
  }
}
