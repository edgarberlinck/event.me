import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteGoogleCalendarEvent } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma.server";
import { sendBookingStatusChangedEmail } from "@/lib/resend";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["confirmed", "cancelled", "completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify booking belongs to user
    const booking = await prisma.booking.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        eventType: true,
      },
    });

    // Delete Google Calendar event when cancelling
    if (status === "cancelled" && booking.googleCalendarEventId) {
      try {
        await deleteGoogleCalendarEvent(user.id, booking.googleCalendarEventId);
      } catch (calendarError) {
        console.error(
          `Failed to delete Google Calendar event ${booking.googleCalendarEventId} for booking ${booking.id}:`,
          calendarError,
        );
      }
    }

    // Send email notification
    try {
      await sendBookingStatusChangedEmail({
        to: session.user.email,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        eventTitle: updatedBooking.eventType.title,
        startTime: updatedBooking.startTime,
        endTime: updatedBooking.endTime,
        status,
      });
    } catch (emailError) {
      console.error("Email notification error:", emailError);
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Booking update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
