"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function AuthToast() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    const success = searchParams.get("success");

    if (error === "invalid") {
      toast.error("Invalid email or password. Please try again.");
    } else if (error === "exists") {
      toast.error("An account with this email already exists.", {
        description: "Please sign in instead.",
        action: {
          label: "Sign In",
          onClick: () => (window.location.href = "/login"),
        },
      });
    }

    if (success === "registered") {
      toast.success("Account created successfully!", {
        description: "Please sign in with your credentials.",
      });
    }
  }, [searchParams]);

  return null;
}
