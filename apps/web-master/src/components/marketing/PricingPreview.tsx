"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Check, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PricingPreviewProps {
  lang: string;
}

const pricing = [
  {
    name: "Free",
    description: "Perfect for pilots and proof of value.",
    monthly: "$0",
    yearly: "$0",
    href: "/contact",
    features: ["2 automations", "Community support"]
  },
  {
    name: "Pro",
    description: "Best for teams operationalizing AI-driven workflows.",
    monthly: "$29",
    yearly: "$290",
    href: "/contact",
    features: ["Unlimited automations", "Priority support", "100GB secure storage", "Advanced insights"],
    highlighted: true
  },
  {
    name: "Enterprise",
    description: "For regulated industries and global deployments.",
    monthly: "Custom",
    yearly: "Custom",
    href: "/contact",
    features: ["Dedicated advisor", "Private cloud options"]
  }
];

export function PricingPreview({ lang }: PricingPreviewProps) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(true);
  const [targetHeight, setTargetHeight] = useState<number | undefined>(undefined);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Measure PlatformFeatures height and apply it to this container
  useEffect(() => {
    if (!hasMounted) return;
    
    const featuresContainer = document.getElementById("platform-features-container");
    if (!featuresContainer) return;

    const updateHeight = () => {
      const header = featuresContainer.children[0] as HTMLElement;
      const grid = featuresContainer.children[1] as HTMLElement;
      
      if (header && grid) {
        const gridStyle = window.getComputedStyle(grid);
        const marginTop = parseFloat(gridStyle.marginTop);
        const totalHeight = header.offsetHeight + grid.offsetHeight + marginTop;
        setTargetHeight(totalHeight);
      }
    };

    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(featuresContainer);
    Array.from(featuresContainer.children).forEach(child => resizeObserver.observe(child));

    return () => resizeObserver.disconnect();
  }, [hasMounted]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isAtTop = scrollTop <= 5;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
      
      setCanScrollUp(!isAtTop);
      setCanScrollDown(!isAtBottom);
    }
  };

  const scrollUp = () => {
    if (scrollContainerRef.current) {
      const cardHeight = scrollContainerRef.current.clientHeight * 0.6;
      scrollContainerRef.current.scrollBy({ top: -cardHeight, behavior: "smooth" });
      setTimeout(handleScroll, 100);
    }
  };

  const scrollDown = () => {
    if (scrollContainerRef.current) {
      const cardHeight = scrollContainerRef.current.clientHeight * 0.6;
      scrollContainerRef.current.scrollBy({ top: cardHeight, behavior: "smooth" });
      setTimeout(handleScroll, 100);
    }
  };

  // Set up scroll event listener and check initial state
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScrollState = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const canScroll = scrollHeight > clientHeight;
      
      if (!canScroll) {
        setCanScrollUp(false);
        setCanScrollDown(false);
      } else {
        const isAtTop = scrollTop <= 5;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
        setCanScrollUp(!isAtTop);
        setCanScrollDown(!isAtBottom);
      }
    };

    const timeoutId = setTimeout(checkScrollState, 200);
    container.addEventListener("scroll", checkScrollState);
    
    const resizeObserver = new ResizeObserver(checkScrollState);
    resizeObserver.observe(container);
    
    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener("scroll", checkScrollState);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div 
      className="flex flex-col gap-6 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-white p-6"
      style={{ height: hasMounted && targetHeight ? `${targetHeight}px` : '100%' }}
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Simple Pricing</h2>
        <p className="text-muted-foreground">Choose the plan that fits your automation journey.</p>
        <div className="mt-4 inline-flex rounded-full border bg-white p-1">
          {["yearly", "monthly"].map((option) => (
            <button
              key={option}
              onClick={() => setBilling(option as "monthly" | "yearly")}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-full transition-colors",
                billing === option ? "bg-rose-500 text-white" : "text-slate-600"
              )}
            >
              {option === "yearly" ? "Yearly" : "Monthly"}
            </button>
          ))}
        </div>
      </div>

      {/* Fixed height scrollable container matching feature cards height */}
      <div
        ref={scrollContainerRef}
        className="overflow-y-auto overscroll-contain flex-1 min-h-0"
        onScroll={handleScroll}
        style={{ scrollbarWidth: "thin" }}
      >
        <div className="space-y-4 pr-2">
          {pricing.map((tier) => {
            return (
              <Card
                key={tier.name}
                className={cn(
                  "border-slate-200 flex flex-col",
                  tier.highlighted && "border-rose-400 shadow-lg"
                )}
              >
                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    <Button
                      className={cn(
                        "text-sm",
                        tier.highlighted ? "bg-rose-500 text-white hover:bg-rose-600" : "bg-primary text-white"
                      )}
                      asChild
                    >
                      <Link href={`/${lang}${tier.href}`}>Talk to us</Link>
                    </Button>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                      {tier[billing]}
                      {billing === "monthly" && tier.monthly !== "Custom" ? "/mo" : tier.yearly !== "Custom" ? "/yr" : ""}
                    </span>
                  </div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                {tier.features.length > 0 && (
                  <CardContent className="pt-0 flex-1 flex flex-col justify-end">
                    <ul className="space-y-1.5 text-sm">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Scroll controls outside the container */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={scrollUp}
          disabled={!canScrollUp}
          className="rounded-full"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <div className="text-xs text-muted-foreground">Scroll</div>
        <Button
          variant="outline"
          size="sm"
          onClick={scrollDown}
          disabled={!canScrollDown}
          className="rounded-full"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-center text-sm font-medium text-primary">
        <Link href={`/${lang}/resources/faq`}>View detailed pricing →</Link>
      </div>
    </div>
  );
}
