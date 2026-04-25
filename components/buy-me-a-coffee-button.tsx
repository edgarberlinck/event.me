import Link from "next/link";
import { cn } from "@/lib/utils";

const BUY_ME_A_COFFEE_URL = "https://buymeacoffee.com/edgarberlinck";

interface BuyMeACoffeeButtonProps {
  className?: string;
}

export function BuyMeACoffeeButton({ className }: BuyMeACoffeeButtonProps) {
  return (
    <Link
      href={BUY_ME_A_COFFEE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-yellow-300 transition-colors",
        className,
      )}
    >
      <span>☕</span>
      <span>Buy me a coffee</span>
    </Link>
  );
}
