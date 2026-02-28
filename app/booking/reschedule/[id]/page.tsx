"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, startOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

interface ReschedulePageProps {
  params: Promise<{ id: string }>;
}

interface Slot {
  start: Date;
  end: Date;
}

export default function ReschedulePage({ params }: ReschedulePageProps) {
  const router = useRouter();
  const [bookingId, setBookingId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Get booking ID from params
  useState(() => {
    params.then((p) => setBookingId(p.id));
  });

  const handleDateSelect = async (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);

    if (!date) {
      setAvailableSlots([]);
      return;
    }

    setLoadingSlots(true);
    try {
      // For now, generate mock slots - in production this should fetch from API
      const slots: Slot[] = [];
      const baseDate = new Date(date);
      baseDate.setHours(9, 0, 0, 0);

      for (let i = 0; i < 8; i++) {
        const start = new Date(baseDate);
        start.setHours(9 + i);
        const end = new Date(start);
        end.setMinutes(start.getMinutes() + 30);
        slots.push({ start, end });
      }

      setAvailableSlots(slots);
    } catch (error) {
      toast.error("Failed to load available slots");
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/reschedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startTime: selectedSlot.start.toISOString(),
          endTime: selectedSlot.end.toISOString(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reschedule booking");
      }

      toast.success("Booking rescheduled successfully!");
      router.push("/book/success");
    } catch (error) {
      console.error("Reschedule error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reschedule booking";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Reschedule Booking</CardTitle>
            <CardDescription>
              Select a new date and time for your meeting
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                      <>
                        <div className="space-y-2 mb-6">
                          {availableSlots.map((slot, index) => (
                            <Button
                              key={index}
                              type="button"
                              variant={
                                selectedSlot?.start.getTime() ===
                                slot.start.getTime()
                                  ? "default"
                                  : "outline"
                              }
                              className="w-full"
                              onClick={() => setSelectedSlot(slot)}
                            >
                              {format(slot.start, "HH:mm")} -{" "}
                              {format(slot.end, "HH:mm")}
                            </Button>
                          ))}
                        </div>

                        {selectedSlot && (
                          <Button
                            onClick={handleSubmit}
                            className="w-full"
                            disabled={submitting}
                          >
                            {submitting
                              ? "Rescheduling..."
                              : "Confirm new time"}
                          </Button>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
