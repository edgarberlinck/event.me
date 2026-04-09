"use client";

import type { Booking, EventType } from "@prisma/client";
import { format } from "date-fns";
import { UserX, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BookingsTableProps {
  bookings: (Booking & { eventType: EventType })[];
}

export function BookingsTable({
  bookings: initialBookings,
}: BookingsTableProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [markingNoShow, setMarkingNoShow] = useState<string | null>(null);

  const handleCancel = async (bookingId: string) => {
    setCancelling(bookingId);

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }

      setBookings(
        bookings.map((b) =>
          b.id === bookingId ? { ...b, status: "cancelled" } : b,
        ),
      );

      toast.success("Booking cancelled successfully");
    } catch (_error) {
      toast.error("Failed to cancel booking");
    } finally {
      setCancelling(null);
    }
  };

  const handleNoShow = async (bookingId: string) => {
    setMarkingNoShow(bookingId);

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "no_show" }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark as no show");
      }

      setBookings(
        bookings.map((b) =>
          b.id === bookingId ? { ...b, status: "no_show" } : b,
        ),
      );

      toast.success("Booking marked as no show");
    } catch (_error) {
      toast.error("Failed to mark as no show");
    } finally {
      setMarkingNoShow(null);
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No bookings yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{booking.eventType.title}</h3>
              <Badge
                variant={
                  booking.status === "confirmed"
                    ? "default"
                    : booking.status === "cancelled"
                      ? "destructive"
                      : booking.status === "no_show"
                        ? "destructive"
                        : "secondary"
                }
              >
                {booking.status === "no_show" ? "No Show" : booking.status}
              </Badge>
            </div>

            <p className="text-sm text-gray-600">
              {format(new Date(booking.startTime), "PPP 'at' p")}
            </p>

            <div className="text-sm">
              <p className="text-gray-600">
                <span className="font-medium">Guest:</span> {booking.guestName}{" "}
                ({booking.guestEmail})
              </p>
              {booking.guestNotes && (
                <p className="text-gray-600 mt-1">
                  <span className="font-medium">Notes:</span>{" "}
                  {booking.guestNotes}
                </p>
              )}
            </div>
          </div>

          {booking.status === "confirmed" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNoShow(booking.id)}
                disabled={markingNoShow === booking.id}
              >
                <UserX className="w-4 h-4 mr-1" />
                {markingNoShow === booking.id ? "Saving..." : "No Show"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCancel(booking.id)}
                disabled={cancelling === booking.id}
              >
                <X className="w-4 h-4 mr-1" />
                {cancelling === booking.id ? "Cancelling..." : "Cancel"}
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
