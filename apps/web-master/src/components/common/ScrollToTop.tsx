"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ChevronUp } from "lucide-react";

export function ScrollToTop() {
  const t = useTranslations();
  const [isVisible, setIsVisible] = useState(false);
  const [bottomPosition, setBottomPosition] = useState(32); // Default 8 * 4 = 32px (bottom-8)
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    const updatePosition = () => {
      // Check if user has scrolled enough to show button
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Calculate position relative to footer
      const footer = document.querySelector('footer');
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // If footer is visible in viewport
        if (footerRect.top < viewportHeight) {
          // Calculate how much of footer is visible
          const footerVisibleHeight = viewportHeight - footerRect.top;
          // Position button above footer with 32px margin
          setBottomPosition(Math.max(32, footerVisibleHeight + 32));
        } else {
          // Footer not visible, use default position
          setBottomPosition(32);
        }
      }
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [hasMounted]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!hasMounted) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      style={{ bottom: `${bottomPosition}px` }}
      className={`fixed right-8 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-label={t("scrollToTop")}
    >
      <ChevronUp className="h-6 w-6" />
    </button>
  );
}
