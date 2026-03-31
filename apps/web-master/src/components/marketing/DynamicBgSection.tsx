"use client";

import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getFallbackImage } from "@/lib/imageFallback";

interface DynamicBgSectionProps {
  children: ReactNode;
  className?: string;
  backgroundImage?: string;
}

// CMS: These will be pulled from CMS - rotating backgrounds for home page
const fallbackBackgroundImages = [
  getFallbackImage('hero'),
  getFallbackImage('hero'),
  getFallbackImage('hero'),
  getFallbackImage('hero'),
  getFallbackImage('hero'),
];

export function DynamicBgSection({ children, className, backgroundImage }: DynamicBgSectionProps) {
  // Start deterministically on the server; randomize only after mount
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const images = backgroundImage ? [backgroundImage, ...fallbackBackgroundImages] : fallbackBackgroundImages;

  useEffect(() => {
    setIsMounted(true);
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Rotate through images every 5 seconds (client-only)
    if (!isClient) return;

    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isClient, images.length]);

  return (
    <section className={cn("relative overflow-hidden", className)} suppressHydrationWarning>
      {/* Background Image using next/image for optimization */}
      <Image
        src={images[currentBgIndex]}
        alt="Hero background"
        fill
        priority
        quality={85}
        sizes="100vw"
        className="object-cover transition-opacity duration-1000"
        style={{ objectPosition: 'center' }}
        suppressHydrationWarning
      />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-[1]" />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </section>
  );
}
