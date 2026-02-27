import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma.server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditEventTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const eventType = await prisma.eventType.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!eventType) {
    notFound();
  }

  async function updateEventType(formData: FormData) {
    "use server";

    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const duration = Number.parseInt(formData.get("duration") as string);
    const active = formData.get("active") === "on";

    if (!title || !slug || !duration) {
      throw new Error("Missing required fields");
    }

    await prisma.eventType.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        title,
        slug,
        description,
        duration,
        active,
      },
    });

    redirect("/dashboard/event-types");
  }

  async function deleteEventType() {
    "use server";

    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    await prisma.eventType.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    redirect("/dashboard/event-types");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Link href="/dashboard/event-types">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Edit Event Type</CardTitle>
            <CardDescription>Update your event type settings</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateEventType} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={eventType.title}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  defaultValue={eventType.slug}
                  required
                />
                <p className="text-sm text-gray-500">
                  This will be part of your booking link
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  defaultValue={eventType.duration}
                  min="15"
                  step="15"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={eventType.description || ""}
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  defaultChecked={eventType.active}
                  className="h-4 w-4"
                />
                <Label htmlFor="active">Active</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  formAction={deleteEventType}
                  onClick={(e) => {
                    if (!confirm("Are you sure you want to delete this event type?")) {
                      e.preventDefault();
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
