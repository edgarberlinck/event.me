import { type NextRequest, NextResponse } from "next/server";
import { getGoogleCalendarClient } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma.server";
import { sendBookingRescheduledEmail } from "@/lib/resend";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { startTime, endTime } = body;

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: "Start time and end time are required" },
        { status: 400 },
      );
    }

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
        { error: "Cannot reschedule a cancelled booking" },
        { status: 400 },
      );
    }

    const newStartTime = new Date(startTime);
    const newEndTime = new Date(endTime);

    // Update Google Calendar event
    let meetLink = booking.meetLink;
    if (booking.googleCalendarEventId) {
      try {
        const calendar = await getGoogleCalendarClient(booking.userId);

        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const cancelUrl = `${baseUrl}/api/bookings/${booking.id}/cancel`;
        const rescheduleUrl = `${baseUrl}/booking/reschedule/${booking.id}`;

        const description = [
          booking.eventType.description || "",
          "",
          booking.guestNotes ? `Notes from guest:\n${booking.guestNotes}` : "",
          "",
          "---",
          `Cancel this booking: ${cancelUrl}`,
          `Reschedule this booking: ${rescheduleUrl}`,
        ]
          .filter(Boolean)
          .join("\n");

        const response = await calendar.events.patch({
          calendarId: "primary",
          eventId: booking.googleCalendarEventId,
          sendUpdates: "all",
          requestBody: {
            start: {
              dateTime: newStartTime.toISOString(),
            },
            end: {
              dateTime: newEndTime.toISOString(),
            },
            description,
          },
        });

        meetLink = response.data.hangoutLink || booking.meetLink;
      } catch (error) {
        console.error("Failed to update Google Calendar event:", error);
        return NextResponse.json(
          { error: "Failed to update calendar event" },
          { status: 500 },
        );
      }
    }

    // Update booking
    await prisma.booking.update({
      where: { id },
      data: {
        startTime: newStartTime,
        endTime: newEndTime,
        meetLink,
      },
    });

    // Send email notification
    try {
      await sendBookingRescheduledEmail({
        to: booking.user.email,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        eventTitle: booking.eventType.title,
        startTime: newStartTime,
        endTime: newEndTime,
        previousStartTime: booking.startTime,
        previousEndTime: booking.endTime,
        meetLink,
      });
    } catch (emailError) {
      console.error("Email notification error:", emailError);
    }

    // Redirect to confirmation page
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/booking/rescheduled/${id}`);
  } catch (error) {
    console.error("Error rescheduling booking:", error);
    return NextResponse.json(
      { error: "Failed to reschedule booking" },
      { status: 500 },
    );
  }
}
