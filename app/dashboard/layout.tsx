import { Calendar, LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { DashboardMobileNav } from "@/components/dashboard-mobile-nav";
import { Button } from "@/components/ui/button";

async function handleSignOut() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="relative border-b bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold">Event.me</span>
              </div>
              <nav className="hidden md:flex gap-4">
                <Button variant="ghost" asChild>
                  <a href="/dashboard">Dashboard</a>
                </Button>
                <Button variant="ghost" asChild>
                  <a href="/dashboard/event-types">Event Types</a>
                </Button>
                <Button variant="ghost" asChild>
                  <a href="/dashboard/bookings">Bookings</a>
                </Button>
                <Button variant="ghost" asChild>
                  <a href="/dashboard/availability">Availability</a>
                </Button>
                <Button variant="ghost" asChild>
                  <a href="/dashboard/settings">Settings</a>
                </Button>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:block text-sm">
                <p className="font-medium">{session.user.name}</p>
                <p className="text-gray-500">{session.user.email}</p>
              </div>
              <form action={handleSignOut} className="hidden md:block">
                <Button variant="ghost" size="icon" type="submit">
                  <LogOut className="h-5 w-5" />
                </Button>
              </form>
              <DashboardMobileNav
                userName={session.user.name}
                userEmail={session.user.email}
                signOutAction={handleSignOut}
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
