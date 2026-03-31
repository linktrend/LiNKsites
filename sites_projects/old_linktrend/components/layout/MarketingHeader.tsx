'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, Sparkles, ChevronDown } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface MarketingHeaderProps {
  user: any;
  showNavigation?: boolean;
}

const navigationItems = {
  platform: {
    label: 'Platform',
    items: [
      { label: 'Advantage 1', href: '/platform/advantage-1' },
      { label: 'Advantage 2', href: '/platform/advantage-2' },
      { label: 'AI', href: '/platform/ai' },
      { label: 'Innovation & Support', href: '/platform/innovation-support' },
    ],
  },
  solutions: {
    label: 'Solutions',
    items: [
      { label: 'Customers', href: '/solutions/customers' },
      { label: 'Industry', href: '/solutions/industry' },
      { label: 'Company Size', href: '/solutions/company-size' },
      { label: 'Role', href: '/solutions/role' },
    ],
  },
  resources: {
    label: 'Resources',
    items: [
      { label: 'Library', href: '/resources/library' },
      { label: 'For Customers', href: '/resources/for-customers' },
    ],
  },
};

// External app URL - update this to your actual app domain
const APP_URL = 'http://localhost:3000';

export default function MarketingHeader({ user, showNavigation = false }: MarketingHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileSection, setExpandedMobileSection] = useState<string | null>(null);

  const toggleMobileSection = (section: string) => {
    setExpandedMobileSection(expandedMobileSection === section ? null : section);
  };

  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold">LTM Starter Kit</span>
        </Link>

        {/* Desktop Navigation Links */}
        {showNavigation && (
        <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
          {/* Platform Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
              Platform
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {navigationItems.platform.items.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} className="w-full cursor-pointer">
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Solutions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
              Solutions
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {navigationItems.solutions.items.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} className="w-full cursor-pointer">
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Pricing Link */}
          <Link 
            href="/pricing" 
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Pricing
          </Link>

          {/* Enterprise Link */}
          <Link 
            href="/enterprise" 
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Enterprise
          </Link>

          {/* Resources Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
              Resources
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {navigationItems.resources.items.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} className="w-full cursor-pointer">
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        )}

        {/* Desktop Right Side: Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button asChild variant="outline">
            <a href={`${APP_URL}/login`}>Log In</a>
          </Button>
          <Button asChild variant="default">
            <a href={`${APP_URL}/signup`}>Sign Up</a>
          </Button>

          {/* Hamburger Menu (Desktop) */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col gap-4 py-4">
                <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
                <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile: Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col gap-2 py-4">
                <a href={`${APP_URL}/login`} className="px-4 py-2">Log In</a>
                <a href={`${APP_URL}/signup`} className="px-4 py-2">Sign Up</a>
                <div className="border-t my-2"></div>
                <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-2">About Us</Link>
                <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-2">Contact Us</Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
