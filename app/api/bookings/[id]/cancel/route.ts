import { type NextRequest, NextResponse } from "next/server";
import { getGoogleCalendarClient } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma.server";

async function cancelBooking(id: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: true,
      eventType: true,
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
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
  await prisma.booking.update({
    where: { id },
    data: { status: "cancelled" },
  });

  // Redirect to confirmation page
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return NextResponse.redirect(`${baseUrl}/booking/cancelled/${id}`);
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    return await cancelBooking(id);
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 },
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    return await cancelBooking(id);
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 },
    );
  }
}
