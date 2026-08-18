"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface DynamicBgSectionProps {
  children: ReactNode;
  className?: string;
  backgroundImage?: string;
}

export function DynamicBgSection({ children, className, backgroundImage }: DynamicBgSectionProps) {
  return (
    <section
      className={cn("relative overflow-hidden", className)}
      style={{ background: "var(--gradient-hero, var(--gradient-surface-hero, #0f172a))" }}
    >
      {/* Background Image using next/image for optimization */}
      {backgroundImage ? (
        <Image
          src={backgroundImage}
          alt=""
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: 'center' }}
        />
      ) : null}
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-[1]" />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </section>
  );
}
