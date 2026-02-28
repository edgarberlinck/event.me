import { ArrowLeft, CalendarCheck2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma.server";

export default async function BookingRescheduledPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: true,
      eventType: true,
    },
  });

  if (!booking) {
    notFound();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CalendarCheck2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Booking Rescheduled!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-gray-600">
            <p>Your meeting has been successfully rescheduled.</p>
            <p className="mt-2 text-sm">
              A calendar invitation with the updated details has been sent to
              your email.
            </p>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div>
              <p className="text-sm text-gray-500">Event Type</p>
              <p className="font-medium">{booking.eventType.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">New Time</p>
              <p className="font-medium">
                {new Date(booking.startTime).toLocaleString("en-US", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium">
                {booking.eventType.duration} minutes
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">With</p>
              <p className="font-medium">{booking.user.name}</p>
            </div>
            {booking.meetLink && (
              <div>
                <p className="text-sm text-gray-500">Meeting Link</p>
                <Link
                  href={booking.meetLink}
                  target="_blank"
                  className="text-blue-600 hover:underline break-all"
                >
                  {booking.meetLink}
                </Link>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
