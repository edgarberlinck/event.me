import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_APIKEY);

const EMAIL_FROM = "onboarding@resend.dev";

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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

  const safeEventTitle = escapeHtml(eventTitle);
  const safeGuestName = escapeHtml(guestName);
  const safeGuestEmail = escapeHtml(guestEmail);
  const safeNotes = guestNotes ? escapeHtml(guestNotes) : null;
  const safeMeetLink = meetLink ? escapeHtml(meetLink) : null;

  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `New Booking: ${eventTitle} with ${guestName}`,
    html: `
      <h2>New Booking Scheduled</h2>
      <p>A new booking has been scheduled.</p>
      <ul>
        <li><strong>Event:</strong> ${safeEventTitle}</li>
        <li><strong>Guest:</strong> ${safeGuestName} (${safeGuestEmail})</li>
        <li><strong>Start:</strong> ${formatDateTime(startTime)}</li>
        <li><strong>End:</strong> ${formatDateTime(endTime)}</li>
        ${safeNotes ? `<li><strong>Notes:</strong> ${safeNotes}</li>` : ""}
        ${safeMeetLink ? `<li><strong>Meet Link:</strong> <a href="${safeMeetLink}">${safeMeetLink}</a></li>` : ""}
      </ul>
    `,
  });
}

export async function sendBookingCancelledEmail(params: BookingEmailParams) {
  const { to, guestName, guestEmail, eventTitle, startTime, endTime } = params;

  const safeEventTitle = escapeHtml(eventTitle);
  const safeGuestName = escapeHtml(guestName);
  const safeGuestEmail = escapeHtml(guestEmail);

  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Booking Cancelled: ${eventTitle} with ${guestName}`,
    html: `
      <h2>Booking Cancelled</h2>
      <p>A booking has been cancelled.</p>
      <ul>
        <li><strong>Event:</strong> ${safeEventTitle}</li>
        <li><strong>Guest:</strong> ${safeGuestName} (${safeGuestEmail})</li>
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

  const safeEventTitle = escapeHtml(eventTitle);
  const safeGuestName = escapeHtml(guestName);
  const safeGuestEmail = escapeHtml(guestEmail);
  const safeMeetLink = meetLink ? escapeHtml(meetLink) : null;

  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Booking Rescheduled: ${eventTitle} with ${guestName}`,
    html: `
      <h2>Booking Rescheduled</h2>
      <p>A booking has been rescheduled.</p>
      <ul>
        <li><strong>Event:</strong> ${safeEventTitle}</li>
        <li><strong>Guest:</strong> ${safeGuestName} (${safeGuestEmail})</li>
        <li><strong>Previous Time:</strong> ${formatDateTime(previousStartTime)} - ${formatDateTime(previousEndTime)}</li>
        <li><strong>New Start:</strong> ${formatDateTime(startTime)}</li>
        <li><strong>New End:</strong> ${formatDateTime(endTime)}</li>
        ${safeMeetLink ? `<li><strong>Meet Link:</strong> <a href="${safeMeetLink}">${safeMeetLink}</a></li>` : ""}
      </ul>
    `,
  });
}

export async function sendBookingStatusChangedEmail(
  params: BookingEmailParams & { status: string },
) {
  const { to, guestName, guestEmail, eventTitle, startTime, endTime, status } =
    params;

  const safeEventTitle = escapeHtml(eventTitle);
  const safeGuestName = escapeHtml(guestName);
  const safeGuestEmail = escapeHtml(guestEmail);
  const safeStatus = escapeHtml(status);
  const capitalizedStatus =
    safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1);

  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}: ${eventTitle} with ${guestName}`,
    html: `
      <h2>Booking ${capitalizedStatus}</h2>
      <p>A booking status has been updated to <strong>${safeStatus}</strong>.</p>
      <ul>
        <li><strong>Event:</strong> ${safeEventTitle}</li>
        <li><strong>Guest:</strong> ${safeGuestName} (${safeGuestEmail})</li>
        <li><strong>Start:</strong> ${formatDateTime(startTime)}</li>
        <li><strong>End:</strong> ${formatDateTime(endTime)}</li>
      </ul>
    `,
  });
}
