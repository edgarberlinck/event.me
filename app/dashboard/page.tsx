import { Calendar, Clock, LogOut, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

async function handleSignOut() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold">Event.me</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <p className="font-medium">{session.user.name}</p>
                <p className="text-gray-500">{session.user.email}</p>
              </div>
              <form action={handleSignOut}>
                <Button variant="ghost" size="icon" type="submit">
                  <LogOut className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">No bookings yet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Event Types</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Create your first event type
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Availability
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Not Set</div>
              <p className="text-xs text-muted-foreground">
                Configure your hours
              </p>
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
                  <Button variant="link" className="px-0">
                    Configure now →
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
                  <Button variant="link" className="px-0">
                    Create event type →
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
              <CardDescription>
                Your latest bookings and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm mt-2">
                  Your bookings will appear here once people start scheduling
                  with you.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
