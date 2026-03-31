'use client';

import { ChevronDown } from 'lucide-react';

/**
 * ScrollIndicator - Animated bouncing arrow indicator
 * 
 * Features:
 * - Bouncing animation using CSS
 * - Smooth scroll to target section on click
 * - Centered at bottom of section
 */
export function ScrollIndicator() {
  const handleScroll = () => {
    // Scroll to the next section smoothly
    const nextSection = document.getElementById('platform-features');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex justify-center">
      <button
        onClick={handleScroll}
        className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors group"
        aria-label="Scroll to next section"
      >
        <span className="text-sm font-bold">Learn More</span>
        <ChevronDown className="h-6 w-6 animate-bounce" />
      </button>
    </div>
  );
}

