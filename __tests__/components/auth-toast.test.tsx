import { render } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthToast } from "@/components/auth-toast";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: vi.fn((key: string) => {
      if (key === "error") return "invalid";
      return null;
    }),
  }),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("AuthToast Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows error toast for invalid credentials", () => {
    render(<AuthToast />);
    expect(toast.error).toHaveBeenCalledWith(
      "Invalid email or password. Please try again.",
    );
  });
});
