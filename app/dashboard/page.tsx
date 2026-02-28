import { Calendar, Clock, Users } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma.server";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const [availability, eventTypes, bookingsCount, recentBookings] =
    await Promise.all([
      prisma.availability.findMany({
        where: { userId: session.user.id },
        orderBy: { dayOfWeek: "asc" },
      }),
      prisma.eventType.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.count({
        where: { userId: session.user.id },
      }),
      prisma.booking.findMany({
        where: { userId: session.user.id },
        include: { eventType: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const DAYS_OF_WEEK = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome back, {session.user.name?.split(" ")[0]}! 👋
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingsCount}</div>
            <p className="text-xs text-muted-foreground">
              {bookingsCount === 0 ? "No bookings yet" : "Total bookings"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Event Types</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {eventTypes.length === 0 ? (
              <>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Create your first event type
                </p>
              </>
            ) : (
              <div className="space-y-2">
                {eventTypes.slice(0, 3).map((event) => (
                  <div key={event.id} className="text-sm">
                    <span className="font-medium">{event.title}</span>{" "}
                    <span className="text-muted-foreground">
                      ({event.duration} min)
                    </span>
                  </div>
                ))}
                {eventTypes.length > 3 && (
                  <Button
                    variant="link"
                    className="px-0 h-auto text-xs"
                    asChild
                  >
                    <a href="/dashboard/event-types">
                      View all {eventTypes.length} event types →
                    </a>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Availability</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {availability.length === 0 ? (
              <>
                <div className="text-2xl font-bold">Not Set</div>
                <p className="text-xs text-muted-foreground">
                  Configure your hours
                </p>
              </>
            ) : (
              <div className="space-y-2">
                {availability.map((slot) => (
                  <div key={slot.id} className="text-sm">
                    <span className="font-medium">
                      {DAYS_OF_WEEK[slot.dayOfWeek]}:
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>
              Get started with Event.me in 3 simple steps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Set Your Availability</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Define when you&apos;re available for meetings
                </p>
                <Button variant="link" className="px-0" asChild>
                  <a href="/dashboard/availability">Configure now →</a>
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Create Event Types</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Set up different types of meetings you offer
                </p>
                <Button variant="link" className="px-0" asChild>
                  <a href="/dashboard/event-types">Create event type →</a>
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Share Your Link</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Send your booking link to start receiving bookings
                </p>
                <Button variant="link" className="px-0">
                  View link →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest bookings and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm mt-2">
                  Your bookings will appear here once people start scheduling
                  with you.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-start gap-3 pb-3 border-b last:border-0"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          booking.status === "CONFIRMED"
                            ? "bg-green-500"
                            : booking.status === "CANCELLED"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {booking.guestName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.eventType.title} •{" "}
                        {new Date(booking.startTime).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === "CONFIRMED"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "CANCELLED"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {booking.status.toLowerCase()}
                      </span>
                    </div>
                  </div>
                ))}
                {bookingsCount > 5 && (
                  <Button
                    variant="link"
                    className="px-0 h-auto text-xs w-full"
                    asChild
                  >
                    <a href="/dashboard/bookings">
                      View all {bookingsCount} bookings →
                    </a>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
