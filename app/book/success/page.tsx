import { CheckCircle, Calendar, Mail, Video } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface BookingSuccessPageProps {
  searchParams: Promise<{
    guestName?: string;
    guestEmail?: string;
    startTime?: string;
    meetLink?: string;
  }>;
}

export default async function BookingSuccessPage({ searchParams }: BookingSuccessPageProps) {
  const params = await searchParams;
  const { guestName, guestEmail, startTime, meetLink } = params;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
            <CardDescription>
              Your meeting has been scheduled successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {guestName && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Guest Details</p>
                  <p className="text-sm text-gray-600">{guestName}</p>
                  {guestEmail && (
                    <p className="text-sm text-gray-600">{guestEmail}</p>
                  )}
                </div>
              </div>
            )}

            {startTime && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Meeting Time</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(startTime), "MMMM d, yyyy 'at' HH:mm")}
                  </p>
                </div>
              </div>
            )}

            {meetLink && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Video className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-blue-900">Google Meet Link</p>
                  <a 
                    href={meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {meetLink}
                  </a>
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 text-center mb-4">
                A calendar invite with the meeting details has been sent to your email address.
              </p>
              <Button asChild className="w-full">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
