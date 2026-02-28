"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import type { Booking, EventType } from "@prisma/client";

interface BookingsTableProps {
  bookings: (Booking & { eventType: EventType })[];
}

export function BookingsTable({ bookings: initialBookings }: BookingsTableProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [cancelling, setCancelling] = useState<string | null>(null);

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

      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: "cancelled" } : b
      ));
      
      toast.success("Booking cancelled successfully");
    } catch (error) {
      toast.error("Failed to cancel booking");
    } finally {
      setCancelling(null);
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
              <Badge variant={
                booking.status === "confirmed" ? "default" :
                booking.status === "cancelled" ? "destructive" :
                "secondary"
              }>
                {booking.status}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600">
              {format(new Date(booking.startTime), "PPP 'at' p")}
            </p>
            
            <div className="text-sm">
              <p className="text-gray-600">
                <span className="font-medium">Guest:</span> {booking.guestName} ({booking.guestEmail})
              </p>
              {booking.guestNotes && (
                <p className="text-gray-600 mt-1">
                  <span className="font-medium">Notes:</span> {booking.guestNotes}
                </p>
              )}
            </div>
          </div>

          {booking.status === "confirmed" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCancel(booking.id)}
              disabled={cancelling === booking.id}
            >
              <X className="w-4 h-4 mr-1" />
              {cancelling === booking.id ? "Cancelling..." : "Cancel"}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
