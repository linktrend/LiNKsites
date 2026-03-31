"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getFallbackImage } from "@/lib/imageFallback";

interface StaticBgSectionProps {
  children: ReactNode;
  className?: string;
}

// CMS: This will pull from CMS - single static background image for all non-home pages
const staticBackgroundImage = getFallbackImage('hero');

export function StaticBgSection({ children, className }: StaticBgSectionProps) {
  return (
    <section className={cn("relative overflow-hidden", className)}>
      {/* Background Image using next/image for optimization */}
      <Image
        src={staticBackgroundImage}
        alt="Section background"
        fill
        quality={85}
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: 'center' }}
      />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-[1]" />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </section>
  );
}
