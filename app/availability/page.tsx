import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

async function getAvailability(userId: string) {
  return await prisma.availability.findMany({
    where: { userId },
    orderBy: { dayOfWeek: "asc" },
  });
}

async function handleSaveAvailability(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const dayOfWeek = Number.parseInt(formData.get("dayOfWeek") as string, 10);
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;

  // Validate time format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    throw new Error("Invalid time format");
  }

  // Validate end time is after start time
  if (startTime >= endTime) {
    throw new Error("End time must be after start time");
  }

  await prisma.availability.create({
    data: {
      userId: session.user.id,
      dayOfWeek,
      startTime,
      endTime,
    },
  });

  redirect("/availability");
}

async function handleDeleteAvailability(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const id = formData.get("id") as string;

  await prisma.availability.delete({
    where: {
      id,
      userId: session.user.id,
    },
  });

  redirect("/availability");
}

export default async function AvailabilityPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const availability = await getAvailability(session.user.id);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Availability</h1>
        <p className="text-gray-600">
          Set your available hours for each day of the week
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Add New Availability */}
        <Card>
          <CardHeader>
            <CardTitle>Add Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleSaveAvailability} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dayOfWeek">Day of Week</Label>
                <select
                  id="dayOfWeek"
                  name="dayOfWeek"
                  required
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
                  placeholder="09:00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  required
                  placeholder="17:00"
                />
              </div>

              <Button type="submit" className="w-full">
                Add Availability
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Current Availability */}
        <Card>
          <CardHeader>
            <CardTitle>Current Availability</CardTitle>
          </CardHeader>
          <CardContent>
            {availability.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No availability set yet. Add your first time slot!
              </p>
            ) : (
              <div className="space-y-3">
                {availability.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div>
                      <p className="font-medium">
                        {
                          DAYS_OF_WEEK.find((d) => d.value === slot.dayOfWeek)
                            ?.label
                        }
                      </p>
                      <p className="text-sm text-gray-600">
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </div>
                    <form action={handleDeleteAvailability}>
                      <input type="hidden" name="id" value={slot.id} />
                      <Button type="submit" variant="destructive" size="sm">
                        Delete
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Button variant="outline" asChild>
          <a href="/dashboard">Back to Dashboard</a>
        </Button>
      </div>
    </div>
  );
}
