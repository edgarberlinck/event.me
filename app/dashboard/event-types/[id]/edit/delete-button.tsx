"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DeleteButton({
  deleteAction,
}: {
  deleteAction: () => Promise<void>;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event type?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAction();
    } catch (error) {
      console.error("Failed to delete event type", error);
      setIsDeleting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="destructive"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
}
