import Link from "next/link";
import { cn } from "../../lib/utils";

type Props = { href: string; label: string; size?: "sm" | "md" };

export function CTA({ href, label, size = "md" }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold transition hover:opacity-90",
        size === "sm" ? "px-3 py-2 text-sm" : "px-4 py-2"
      )}
    >
      {label}
    </Link>
  );
}
