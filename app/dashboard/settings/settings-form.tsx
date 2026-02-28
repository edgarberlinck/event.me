"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useEffect } from "react";

interface SettingsFormProps {
  user: {
    username: string | null;
    name: string | null;
    email: string;
    timezone: string;
  };
  updateSettings: (
    prevState: any,
    formData: FormData
  ) => Promise<{ error?: string; success?: boolean }>;
}

export function SettingsForm({ user, updateSettings }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState(updateSettings, null);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    } else if (state?.success) {
      toast.success("Settings updated successfully!");
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={user?.name || ""}
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={user?.email || ""}
          disabled
          className="bg-gray-100"
        />
        <p className="text-xs text-gray-500">Email cannot be changed</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">event.me/book/</span>
          <Input
            id="username"
            name="username"
            defaultValue={user?.username || ""}
            placeholder="your-username"
            pattern="[a-z0-9-]+"
            title="Only lowercase letters, numbers, and hyphens"
            disabled={isPending}
          />
        </div>
        <p className="text-xs text-gray-500">
          Your public booking URL will be: event.me/book/
          {user?.username || "your-username"}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <select
          id="timezone"
          name="timezone"
          defaultValue={user?.timezone || "America/New_York"}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          disabled={isPending}
        >
          <optgroup label="Americas">
            <option value="America/New_York">Eastern Time (US & Canada)</option>
            <option value="America/Chicago">Central Time (US & Canada)</option>
            <option value="America/Denver">Mountain Time (US & Canada)</option>
            <option value="America/Los_Angeles">
              Pacific Time (US & Canada)
            </option>
            <option value="America/Sao_Paulo">São Paulo</option>
            <option value="America/Mexico_City">Mexico City</option>
            <option value="America/Buenos_Aires">Buenos Aires</option>
            <option value="America/Toronto">Toronto</option>
          </optgroup>
          <optgroup label="Europe">
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Europe/Stockholm">Stockholm</option>
            <option value="Europe/Berlin">Berlin</option>
            <option value="Europe/Madrid">Madrid</option>
            <option value="Europe/Rome">Rome</option>
            <option value="Europe/Amsterdam">Amsterdam</option>
            <option value="Europe/Brussels">Brussels</option>
            <option value="Europe/Vienna">Vienna</option>
            <option value="Europe/Copenhagen">Copenhagen</option>
            <option value="Europe/Oslo">Oslo</option>
            <option value="Europe/Helsinki">Helsinki</option>
            <option value="Europe/Dublin">Dublin</option>
            <option value="Europe/Lisbon">Lisbon</option>
            <option value="Europe/Zurich">Zurich</option>
          </optgroup>
          <optgroup label="Asia">
            <option value="Asia/Tokyo">Tokyo</option>
            <option value="Asia/Shanghai">Shanghai</option>
            <option value="Asia/Hong_Kong">Hong Kong</option>
            <option value="Asia/Singapore">Singapore</option>
            <option value="Asia/Dubai">Dubai</option>
            <option value="Asia/Seoul">Seoul</option>
            <option value="Asia/Mumbai">Mumbai</option>
            <option value="Asia/Bangkok">Bangkok</option>
          </optgroup>
          <optgroup label="Pacific">
            <option value="Australia/Sydney">Sydney</option>
            <option value="Australia/Melbourne">Melbourne</option>
            <option value="Pacific/Auckland">Auckland</option>
          </optgroup>
        </select>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
