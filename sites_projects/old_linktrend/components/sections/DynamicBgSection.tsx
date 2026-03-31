'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DynamicBgSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function DynamicBgSection({ children, className }: DynamicBgSectionProps) {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    // Fetch a new random image from picsum.photos on component mount
    const randomImageId = Math.floor(Math.random() * 1000);
    setImageUrl(`https://picsum.photos/id/${randomImageId}/1920/1080`);
  }, []);

  return (
    <section
      className={cn('relative bg-cover bg-center', className)}
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/50 z-0" />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
}
