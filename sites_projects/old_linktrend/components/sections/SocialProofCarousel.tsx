'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Testimonial {
  type: 'testimonial';
  quote: string;
  author: string;
  title: string;
}

interface MediaMention {
  type: 'media';
  publication: string;
  quote: string;
}

type SocialProofItem = Testimonial | MediaMention;

const socialProofData: SocialProofItem[] = [
  {
    type: 'testimonial',
    quote: 'This platform transformed how we manage our business. The AI features are game-changing!',
    author: 'Sarah Chen',
    title: 'CEO at TechCorp',
  },
  {
    type: 'media',
    publication: 'TechCrunch',
    quote: 'One of the most innovative SaaS platforms of 2025',
  },
  {
    type: 'testimonial',
    quote: 'Implementation was seamless and the support team was exceptional every step of the way.',
    author: 'Michael Rodriguez',
    title: 'Operations Director at InnovateCo',
  },
  {
    type: 'media',
    publication: 'Forbes',
    quote: 'Top Startup 2025 - Revolutionizing how businesses operate',
  },
  {
    type: 'testimonial',
    quote: 'We\'ve seen a 300% increase in productivity since switching. Highly recommended!',
    author: 'Emily Watson',
    title: 'Product Manager at StartupHub',
  },
  {
    type: 'media',
    publication: 'Product Hunt',
    quote: '#1 Product of the Day',
  },
];

/**
 * SocialProofCarousel - Displays rotating testimonials and media mentions
 * 
 * Features:
 * - Auto-rotates every 5 seconds
 * - Shows both customer testimonials and media mentions
 * - Smooth transitions between items
 * - Responsive design
 */
export function SocialProofCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % socialProofData.length);
    }, 5000); // 5 seconds per item

    return () => clearInterval(interval);
  }, []);

  const currentItem = socialProofData[currentIndex];

  return (
    <div className="flex flex-col gap-4 w-full h-full justify-between">
      <Card className="border-none shadow-none flex-grow flex flex-col justify-start">
        <CardContent className="p-0">
          {currentItem.type === 'testimonial' ? (
            <div className="space-y-4 text-white min-h-[150px]">
              <Quote className="h-8 w-8 text-white opacity-50" />
              <p className="text-lg font-medium leading-relaxed">{currentItem.quote}</p>
              <div className="pt-4">
                <p className="font-semibold">{currentItem.author}</p>
                <p className="text-sm text-white/70">{currentItem.title}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 min-h-[150px]">
              <div className="inline-block px-4 py-2 bg-white/20 rounded-full">
                <p className="text-sm font-semibold text-white">
                  Featured in {currentItem.publication}
                </p>
              </div>
              <p className="text-xl font-semibold leading-relaxed text-white">{currentItem.quote}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {socialProofData.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              index === currentIndex 
                ? 'w-8 bg-white' 
                : 'w-2 bg-black hover:bg-gray-800'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

