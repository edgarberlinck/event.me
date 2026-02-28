"use client";

import { Calendar, CheckCircle2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function GoogleCalendarCard({ isConnected }: { isConnected: boolean }) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Google Calendar Integration
        </CardTitle>
        <CardDescription>
          Connect your Google Calendar to automatically create events and send
          invites with Google Meet links.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Connected to Google Calendar</span>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              To automatically create calendar events and Google Meet links when
              someone books with you, connect your Google Calendar.
            </p>
            <Button
              onClick={() =>
                signIn("google", { callbackUrl: "/dashboard/settings" })
              }
            >
              <Calendar className="mr-2 h-4 w-4" />
              Connect Google Calendar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
