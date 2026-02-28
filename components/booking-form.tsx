"use client";

import type { Availability, EventType } from "@prisma/client";
import { format, startOfDay } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BookingFormProps {
  eventType: EventType & {
    user: {
      availability: Availability[];
      timezone: string;
    };
  };
}

export function BookingForm({ eventType }: BookingFormProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [availableSlots, setAvailableSlots] = useState<
    { start: Date; end: Date }[]
  >([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleDateSelect = async (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);

    if (!date) {
      setAvailableSlots([]);
      return;
    }

    setLoadingSlots(true);
    try {
      const response = await fetch(
        `/api/slots?eventTypeId=${eventType.id}&date=${format(date, "yyyy-MM-dd")}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch slots");
      }

      const data = await response.json();
      setAvailableSlots(
        data.slots.map((slot: { start: string; end: string }) => ({
          start: new Date(slot.start),
          end: new Date(slot.end),
        })),
      );
    } catch (_error) {
      toast.error("Failed to load available slots");
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }

    setSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventTypeId: eventType.id,
          guestName: formData.get("guestName"),
          guestEmail: formData.get("guestEmail"),
          guestNotes: formData.get("guestNotes"),
          startTime: selectedSlot.start.toISOString(),
          endTime: selectedSlot.end.toISOString(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create booking");
      }

      const data = await response.json();

      // Redirect to success page with booking data
      const params = new URLSearchParams({
        guestName: formData.get("guestName") as string,
        guestEmail: formData.get("guestEmail") as string,
        startTime: selectedSlot.start.toISOString(),
        ...(data.meetLink && { meetLink: data.meetLink }),
      });
      router.push(`/book/success?${params.toString()}`);
    } catch (error) {
      console.error("Booking error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create booking";
      toast.error(errorMessage);
      setSubmitting(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h3 className="font-semibold mb-4">Select a date</h3>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={(date) => date < startOfDay(new Date())}
          className="rounded-md border"
        />
      </div>

      <div>
        {selectedDate && (
          <>
            <h3 className="font-semibold mb-4">
              Available times - {format(selectedDate, "MMMM d, yyyy")}
            </h3>

            {loadingSlots ? (
              <p className="text-sm text-gray-500">Loading slots...</p>
            ) : availableSlots.length === 0 ? (
              <p className="text-sm text-gray-500">
                No available slots for this date
              </p>
            ) : (
              <div className="space-y-2 mb-6">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.start.toISOString()}
                    type="button"
                    variant={
                      selectedSlot?.start.getTime() === slot.start.getTime()
                        ? "default"
                        : "outline"
                    }
                    className="w-full"
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {format(slot.start, "HH:mm")} - {format(slot.end, "HH:mm")}
                  </Button>
                ))}
              </div>
            )}

            {selectedSlot && (
              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="guestName">Name *</Label>
                  <Input
                    id="guestName"
                    name="guestName"
                    type="text"
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestEmail">Email *</Label>
                  <Input
                    id="guestEmail"
                    name="guestEmail"
                    type="email"
                    required
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestNotes">Notes (optional)</Label>
                  <Textarea
                    id="guestNotes"
                    name="guestNotes"
                    placeholder="Any additional information..."
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Booking..." : "Confirm booking"}
                </Button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
