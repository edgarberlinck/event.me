import { Calendar, Clock, Edit, Link as LinkIcon, Plus, Trash2 } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
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
import { Badge } from "@/components/ui/badge";

export default async function EventTypesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const eventTypes = await prisma.eventType.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center">
                <Calendar className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold">Event.me</span>
              </Link>
              <nav className="flex gap-4">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/dashboard/event-types" className="text-indigo-600 font-medium">
                  Event Types
                </Link>
                <Link href="/availability" className="text-gray-600 hover:text-gray-900">
                  Availability
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Event Types</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create and manage your meeting types
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/event-types/new">
              <Plus className="h-4 w-4 mr-2" />
              New Event Type
            </Link>
          </Button>
        </div>

        {eventTypes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No event types yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-center max-w-md">
                Create your first event type to start accepting bookings. Define the
                duration, description, and other details.
              </p>
              <Button asChild>
                <Link href="/dashboard/event-types/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event Type
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {eventTypes.map((eventType) => (
              <Card key={eventType.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle>{eventType.title}</CardTitle>
                        <Badge variant={eventType.active ? "default" : "secondary"}>
                          {eventType.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <CardDescription>
                        {eventType.description || "No description"}
                      </CardDescription>
                      <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {eventType.duration} minutes
                        </div>
                        {eventType.maxBookingsPerWeek && (
                          <div className="text-xs bg-blue-50 px-2 py-1 rounded">
                            Max {eventType.maxBookingsPerWeek}/week
                          </div>
                        )}
                        {eventType.minimumNoticeHours > 24 && (
                          <div className="text-xs bg-yellow-50 px-2 py-1 rounded">
                            {eventType.minimumNoticeHours}h notice
                          </div>
                        )}
                        {eventType.maximumNoticeDays < 30 && (
                          <div className="text-xs bg-purple-50 px-2 py-1 rounded">
                            {eventType.maximumNoticeDays} days max
                          </div>
                        )}
                        {user?.username && (
                          <div className="flex items-center gap-1">
                            <LinkIcon className="h-4 w-4" />
                            <a
                              href={`/${user.username}/${eventType.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-700"
                            >
                              /{user.username}/{eventType.slug}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/event-types/${eventType.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <form action={async () => {
                        "use server";
                        await prisma.eventType.delete({
                          where: { id: eventType.id },
                        });
                      }}>
                        <Button
                          variant="outline"
                          size="sm"
                          type="submit"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
