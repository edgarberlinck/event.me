import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_APIKEY);

interface BookingEmailParams {
  to: string;
  guestName: string;
  guestEmail: string;
  eventTitle: string;
  startTime: Date;
  endTime: Date;
  guestNotes?: string | null;
  meetLink?: string | null;
}

function formatDateTime(date: Date): string {
  return date.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export async function sendBookingCreatedEmail(params: BookingEmailParams) {
  const {
    to,
    guestName,
    guestEmail,
    eventTitle,
    startTime,
    endTime,
    guestNotes,
    meetLink,
  } = params;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to,
    subject: `New Booking: ${eventTitle} with ${guestName}`,
    html: `
      <h2>New Booking Scheduled</h2>
      <p>A new booking has been scheduled.</p>
      <ul>
        <li><strong>Event:</strong> ${eventTitle}</li>
        <li><strong>Guest:</strong> ${guestName} (${guestEmail})</li>
        <li><strong>Start:</strong> ${formatDateTime(startTime)}</li>
        <li><strong>End:</strong> ${formatDateTime(endTime)}</li>
        ${guestNotes ? `<li><strong>Notes:</strong> ${guestNotes}</li>` : ""}
        ${meetLink ? `<li><strong>Meet Link:</strong> <a href="${meetLink}">${meetLink}</a></li>` : ""}
      </ul>
    `,
  });
}

export async function sendBookingCancelledEmail(params: BookingEmailParams) {
  const { to, guestName, guestEmail, eventTitle, startTime, endTime } = params;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to,
    subject: `Booking Cancelled: ${eventTitle} with ${guestName}`,
    html: `
      <h2>Booking Cancelled</h2>
      <p>A booking has been cancelled.</p>
      <ul>
        <li><strong>Event:</strong> ${eventTitle}</li>
        <li><strong>Guest:</strong> ${guestName} (${guestEmail})</li>
        <li><strong>Start:</strong> ${formatDateTime(startTime)}</li>
        <li><strong>End:</strong> ${formatDateTime(endTime)}</li>
      </ul>
    `,
  });
}

export async function sendBookingRescheduledEmail(
  params: BookingEmailParams & {
    previousStartTime: Date;
    previousEndTime: Date;
  },
) {
  const {
    to,
    guestName,
    guestEmail,
    eventTitle,
    startTime,
    endTime,
    previousStartTime,
    previousEndTime,
    meetLink,
  } = params;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to,
    subject: `Booking Rescheduled: ${eventTitle} with ${guestName}`,
    html: `
      <h2>Booking Rescheduled</h2>
      <p>A booking has been rescheduled.</p>
      <ul>
        <li><strong>Event:</strong> ${eventTitle}</li>
        <li><strong>Guest:</strong> ${guestName} (${guestEmail})</li>
        <li><strong>Previous Time:</strong> ${formatDateTime(previousStartTime)} - ${formatDateTime(previousEndTime)}</li>
        <li><strong>New Start:</strong> ${formatDateTime(startTime)}</li>
        <li><strong>New End:</strong> ${formatDateTime(endTime)}</li>
        ${meetLink ? `<li><strong>Meet Link:</strong> <a href="${meetLink}">${meetLink}</a></li>` : ""}
      </ul>
    `,
  });
}

export async function sendBookingStatusChangedEmail(
  params: BookingEmailParams & { status: string },
) {
  const { to, guestName, guestEmail, eventTitle, startTime, endTime, status } =
    params;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to,
    subject: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}: ${eventTitle} with ${guestName}`,
    html: `
      <h2>Booking ${status.charAt(0).toUpperCase() + status.slice(1)}</h2>
      <p>A booking status has been updated to <strong>${status}</strong>.</p>
      <ul>
        <li><strong>Event:</strong> ${eventTitle}</li>
        <li><strong>Guest:</strong> ${guestName} (${guestEmail})</li>
        <li><strong>Start:</strong> ${formatDateTime(startTime)}</li>
        <li><strong>End:</strong> ${formatDateTime(endTime)}</li>
      </ul>
    `,
  });
}
