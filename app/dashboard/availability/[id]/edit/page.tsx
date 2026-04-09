import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { prisma } from "@/lib/prisma.server";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default async function EditAvailabilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const availability = await prisma.availability.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!availability) {
    notFound();
  }

  async function updateAvailability(formData: FormData) {
    "use server";

    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const dayOfWeek = Number.parseInt(formData.get("dayOfWeek") as string, 10);
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;

    // Validate time format
    const timeRegex = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      throw new Error("Invalid time format");
    }

    // Validate end time is after start time
    if (startTime >= endTime) {
      throw new Error("End time must be after start time");
    }

    await prisma.availability.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        dayOfWeek,
        startTime,
        endTime,
      },
    });

    redirect("/dashboard/availability");
  }

  return (
    <div>
      <Link href="/dashboard/availability">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </Link>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Edit Availability</CardTitle>
          <CardDescription>Update your availability time slot</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateAvailability} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">Day of Week</Label>
              <select
                id="dayOfWeek"
                name="dayOfWeek"
                required
                defaultValue={availability.dayOfWeek.toString()}
                className="w-full px-3 py-2 border rounded-md"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                required
                defaultValue={availability.startTime}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                required
                defaultValue={availability.endTime}
              />
            </div>

            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
