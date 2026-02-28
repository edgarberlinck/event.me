import { CheckCircle2, XCircle } from "lucide-react";
import { redirect } from "next/navigation";
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

export default async function IntegrationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check if user has Google account connected
  const googleAccount = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      provider: "google",
    },
  });

  const handleConnect = async () => {
    "use server";
    redirect("/api/auth/signin/google?callbackUrl=/dashboard/integrations");
  };

  const handleDisconnect = async () => {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;

    await prisma.account.deleteMany({
      where: {
        userId: session.user.id,
        provider: "google",
      },
    });

    redirect("/dashboard/integrations");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-gray-500 mt-2">
          Connect your accounts to enable calendar sync and meeting links
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-lg border flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="Google Calendar"
                >
                  <title>Google Calendar</title>
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <div>
                <CardTitle>Google Calendar</CardTitle>
                <CardDescription>
                  Sync bookings to your calendar and create Google Meet links
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {googleAccount ? (
                <>
                  <div className="flex items-center text-green-600">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                  <form action={handleDisconnect}>
                    <Button variant="outline" type="submit">
                      Disconnect
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <div className="flex items-center text-gray-400">
                    <XCircle className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Not connected</span>
                  </div>
                  <form action={handleConnect}>
                    <Button type="submit">Connect</Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        {googleAccount && (
          <CardContent className="border-t pt-6">
            <div className="text-sm text-gray-600">
              <p>
                <strong>Connected as:</strong> {session.user.email}
              </p>
              <p className="mt-2">
                All new bookings will be automatically added to your Google
                Calendar with a Google Meet link.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-sm">
            What can you do with this integration?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start">
            <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
            <span>
              Automatically create calendar events when someone books a meeting
            </span>
          </div>
          <div className="flex items-start">
            <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
            <span>
              Generate Google Meet links for virtual meetings automatically
            </span>
          </div>
          <div className="flex items-start">
            <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
            <span>
              Check your calendar for conflicts before accepting bookings
            </span>
          </div>
          <div className="flex items-start">
            <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
            <span>Send calendar invites to your guests automatically</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
