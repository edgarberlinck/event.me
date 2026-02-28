"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface CancelPageProps {
  params: Promise<{ id: string }>;
}

export default function CancelPage({ params }: CancelPageProps) {
  const router = useRouter();
  const [bookingId, setBookingId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  // Get booking ID from params
  useState(() => {
    params.then((p) => setBookingId(p.id));
  });

  const handleCancel = async () => {
    setSubmitting(true);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to cancel booking");
      }

      setCancelled(true);
      toast.success("Booking cancelled successfully!");
    } catch (error) {
      console.error("Cancel error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to cancel booking";
      toast.error(errorMessage);
      setSubmitting(false);
    }
  };

  if (cancelled) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle>Booking Cancelled</CardTitle>
              <CardDescription>
                Your booking has been successfully cancelled
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                All attendees have been notified about the cancellation.
              </p>
              <Button onClick={() => router.push("/")}>Back to Home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <AlertCircle className="h-16 w-16 text-orange-500" />
            </div>
            <CardTitle>Cancel Booking</CardTitle>
            <CardDescription>
              Are you sure you want to cancel this booking?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              This action cannot be undone. All attendees will be notified about
              the cancellation.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={submitting}
              >
                Go Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={submitting}
              >
                {submitting ? "Cancelling..." : "Yes, Cancel Booking"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
