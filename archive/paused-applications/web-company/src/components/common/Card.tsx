import { ReactNode } from "react";
import { cn } from "../../lib/utils";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("border rounded-lg p-4 bg-card text-card-foreground", className)}>{children}</div>;
}
