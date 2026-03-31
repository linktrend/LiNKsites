import Link from "next/link";
import { cn } from "../../lib/utils";

type Props = { href: string; label: string; size?: "sm" | "md"; variant?: "primary" | "accent" };

export function CTA({ href, label, size = "md", variant = "primary" }: Props) {
  const colorClass =
    variant === "accent"
      ? "bg-rose-500 text-white hover:bg-rose-600"
      : "bg-primary text-primary-foreground hover:opacity-90";

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-semibold transition",
        size === "sm" ? "px-3 py-2 text-sm" : "px-4 py-2",
        colorClass
      )}
    >
      {label}
    </Link>
  );
}
