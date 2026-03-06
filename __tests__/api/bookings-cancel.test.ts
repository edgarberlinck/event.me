import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock environment variables BEFORE any imports
process.env.RESEND_APIKEY = "test-api-key";

// Mock dependencies BEFORE importing the route
vi.mock("@/lib/prisma.server", () => ({
  prisma: {
    booking: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/google-calendar", () => ({
  getGoogleCalendarClient: vi.fn(),
}));

vi.mock("@/lib/resend", () => ({
  sendBookingCancelledEmail: vi.fn(),
}));

import { NextRequest } from "next/server";
// Import AFTER mocks
import { GET, POST } from "@/app/api/bookings/[id]/cancel/route";
import { prisma } from "@/lib/prisma.server";

describe("Booking Cancellation API", () => {
  const mockBooking = {
    id: "test-booking-id",
    status: "confirmed",
    userId: "test-user-id",
    guestName: "Test Guest",
    guestEmail: "guest@test.com",
    startTime: new Date(),
    endTime: new Date(),
    googleCalendarEventId: null,
    user: { email: "owner@test.com" },
    eventType: { title: "Test Meeting" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXTAUTH_URL = "http://localhost:3000";
  });

  describe("GET endpoint", () => {
    it("should redirect to confirmation page instead of cancelling directly", async () => {
      const request = new NextRequest(
        new Request(
          "http://localhost:3000/api/bookings/test-booking-id/cancel",
        ),
      );
      const params = Promise.resolve({ id: "test-booking-id" });

      const response = await GET(request, { params });

      // Should redirect to confirmation page
      expect(response.status).toBe(307); // Redirect status
      expect(response.headers.get("location")).toBe(
        "http://localhost:3000/booking/cancel/test-booking-id",
      );

      // Should NOT have called booking.update
      expect(prisma.booking.update).not.toHaveBeenCalled();
    });
  });

  describe("POST endpoint", () => {
    it("should cancel booking when POST is used", async () => {
      vi.mocked(prisma.booking.findUnique).mockResolvedValue(
        mockBooking as never,
      );
      vi.mocked(prisma.booking.update).mockResolvedValue({
        ...mockBooking,
        status: "cancelled",
      } as never);

      const request = new NextRequest(
        new Request(
          "http://localhost:3000/api/bookings/test-booking-id/cancel",
          {
            method: "POST",
          },
        ),
      );
      const params = Promise.resolve({ id: "test-booking-id" });

      const response = await POST(request, { params });

      // Should have cancelled the booking
      expect(prisma.booking.findUnique).toHaveBeenCalledWith({
        where: { id: "test-booking-id" },
        include: {
          user: true,
          eventType: true,
        },
      });

      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: "test-booking-id" },
        data: { status: "cancelled" },
      });

      // Should redirect to cancelled page
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("/booking/cancelled/");
    });

    it("should return error if booking not found", async () => {
      vi.mocked(prisma.booking.findUnique).mockResolvedValue(null);

      const request = new NextRequest(
        new Request("http://localhost:3000/api/bookings/invalid-id/cancel", {
          method: "POST",
        }),
      );
      const params = Promise.resolve({ id: "invalid-id" });

      const response = await POST(request, { params });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe("Booking not found");
    });

    it("should return error if booking already cancelled", async () => {
      vi.mocked(prisma.booking.findUnique).mockResolvedValue({
        ...mockBooking,
        status: "cancelled",
      } as never);

      const request = new NextRequest(
        new Request(
          "http://localhost:3000/api/bookings/test-booking-id/cancel",
          {
            method: "POST",
          },
        ),
      );
      const params = Promise.resolve({ id: "test-booking-id" });

      const response = await POST(request, { params });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Booking already cancelled");
    });
  });
});
