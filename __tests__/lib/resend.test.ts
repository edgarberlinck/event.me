import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn().mockResolvedValue({ id: "test-email-id" }),
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mockSend };
  },
}));

import {
  sendBookingCreatedEmail,
  sendBookingCancelledEmail,
  sendBookingRescheduledEmail,
  sendBookingStatusChangedEmail,
} from "@/lib/resend";

describe("Resend Email Notifications", () => {
  beforeEach(() => {
    mockSend.mockClear();
  });

  const baseParams = {
    to: "user@example.com",
    guestName: "John Doe",
    guestEmail: "john@example.com",
    eventTitle: "30 Minute Meeting",
    startTime: new Date("2026-03-01T10:00:00Z"),
    endTime: new Date("2026-03-01T10:30:00Z"),
  };

  describe("sendBookingCreatedEmail", () => {
    it("should send email with correct parameters", async () => {
      await sendBookingCreatedEmail(baseParams);

      expect(mockSend).toHaveBeenCalledOnce();
      const call = mockSend.mock.calls[0][0];
      expect(call.from).toBe("onboarding@resend.dev");
      expect(call.to).toBe("user@example.com");
      expect(call.subject).toContain("New Booking");
      expect(call.subject).toContain("30 Minute Meeting");
      expect(call.subject).toContain("John Doe");
      expect(call.html).toContain("John Doe");
      expect(call.html).toContain("john@example.com");
    });

    it("should include guest notes when provided", async () => {
      await sendBookingCreatedEmail({
        ...baseParams,
        guestNotes: "Please prepare slides",
      });

      const call = mockSend.mock.calls[0][0];
      expect(call.html).toContain("Please prepare slides");
    });

    it("should include meet link when provided", async () => {
      await sendBookingCreatedEmail({
        ...baseParams,
        meetLink: "https://meet.google.com/abc-def-ghi",
      });

      const call = mockSend.mock.calls[0][0];
      expect(call.html).toContain("https://meet.google.com/abc-def-ghi");
    });
  });

  describe("sendBookingCancelledEmail", () => {
    it("should send cancellation email with correct parameters", async () => {
      await sendBookingCancelledEmail(baseParams);

      expect(mockSend).toHaveBeenCalledOnce();
      const call = mockSend.mock.calls[0][0];
      expect(call.from).toBe("onboarding@resend.dev");
      expect(call.to).toBe("user@example.com");
      expect(call.subject).toContain("Cancelled");
      expect(call.subject).toContain("30 Minute Meeting");
      expect(call.html).toContain("Booking Cancelled");
    });
  });

  describe("sendBookingRescheduledEmail", () => {
    it("should send rescheduled email with old and new times", async () => {
      await sendBookingRescheduledEmail({
        ...baseParams,
        startTime: new Date("2026-03-02T14:00:00Z"),
        endTime: new Date("2026-03-02T14:30:00Z"),
        previousStartTime: new Date("2026-03-01T10:00:00Z"),
        previousEndTime: new Date("2026-03-01T10:30:00Z"),
      });

      expect(mockSend).toHaveBeenCalledOnce();
      const call = mockSend.mock.calls[0][0];
      expect(call.from).toBe("onboarding@resend.dev");
      expect(call.to).toBe("user@example.com");
      expect(call.subject).toContain("Rescheduled");
      expect(call.html).toContain("Previous Time");
      expect(call.html).toContain("New Start");
    });
  });

  describe("sendBookingStatusChangedEmail", () => {
    it("should send status change email with correct status", async () => {
      await sendBookingStatusChangedEmail({
        ...baseParams,
        status: "confirmed",
      });

      expect(mockSend).toHaveBeenCalledOnce();
      const call = mockSend.mock.calls[0][0];
      expect(call.from).toBe("onboarding@resend.dev");
      expect(call.to).toBe("user@example.com");
      expect(call.subject).toContain("Confirmed");
      expect(call.html).toContain("confirmed");
    });
  });
});
