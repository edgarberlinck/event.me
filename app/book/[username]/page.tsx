import { Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma.server";

interface BookingPageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      eventTypes: {
        where: { active: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {user.name || username}
          </h1>
          <p className="text-gray-600">
            Select an event type below to schedule a meeting
          </p>
        </div>

        {user.eventTypes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">
                No available event types at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {user.eventTypes.map((eventType) => (
              <Card
                key={eventType.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {eventType.title}
                  </CardTitle>
                  {eventType.description && (
                    <CardDescription>{eventType.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{eventType.duration} minutes</span>
                      </div>
                      {eventType.maxBookingsPerWeek && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Max {eventType.maxBookingsPerWeek}/week</span>
                        </div>
                      )}
                    </div>
                    <Button asChild>
                      <Link href={`/book/${username}/${eventType.slug}`}>
                        Schedule
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
