'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { useLocalePath } from '@/hooks/useLocalePath';

/**
 * SignupHero - Compressed signup form for the home page
 * 
 * Features:
 * - Social login buttons (Gmail, Apple, Microsoft)
 * - Email and phone input fields side-by-side
 * - Terms acceptance checkbox
 * - Responsive layout that stacks on mobile
 */
export function SignupHero() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { buildPath } = useLocalePath();

  const handleSocialLogin = (provider: string) => {
    // Dev-mode: skip real auth and jump to onboarding step 2
    const params = new URLSearchParams({
      step: '2',
      method: 'social',
      provider,
    });
    router.push(buildPath(`/signup/step-2?${params.toString()}`));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((email || phone) && acceptedTerms) {
      // Dev-mode: simulate email magic link or SMS verification and jump to step 2
      const usingEmail = !!email;
      const params = new URLSearchParams({
        step: '2',
        method: usingEmail ? 'email' : 'phone',
      });
      if (usingEmail) {
        params.set('email', email);
      } else if (phone) {
        params.set('phone', phone);
      }
      router.push(buildPath(`/signup/step-2?${params.toString()}`));
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full justify-center">
      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 text-white">
          Free Sign Up
        </h1>
        <p className="text-lg text-white/70 mb-8">
          In seconds, no credit card required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Social Login Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleSocialLogin('Gmail')}
            className="flex items-center justify-center p-3 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 transition-all"
            aria-label="Sign up with Gmail"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin('Apple')}
            className="flex items-center justify-center p-3 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 transition-all"
            aria-label="Sign up with Apple"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin('Microsoft')}
            className="flex items-center justify-center p-3 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 transition-all"
            aria-label="Sign up with Microsoft"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#f25022" d="M0 0h11.377v11.372H0z"/>
              <path fill="#00a4ef" d="M12.623 0H24v11.372H12.623z"/>
              <path fill="#7fba00" d="M0 12.628h11.377V24H0z"/>
              <path fill="#ffb900" d="M12.623 12.628H24V24H12.623z"/>
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-grow border-t border-border"></div>
          <span className="relative z-10 bg-background px-2 text-xs uppercase text-muted-foreground rounded">OR</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        {/* Email and Phone Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/20 border-white/30 text-white placeholder:text-white/60"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-black/20 border-white/30 text-white placeholder:text-white/60"
            />
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={acceptedTerms}
            onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
            className="mt-1"
          />
          <label htmlFor="terms" className="text-sm text-white/70 leading-tight font-bold">
            By continuing, you accept our{' '}
            <Link href={buildPath('/privacy')} className="text-primary hover:underline">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href={buildPath('/terms')} className="text-primary hover:underline">
              Terms of Use
            </Link>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="default"
          size="lg"
          className="w-full text-lg !bg-[hsl(var(--accent-red))] !text-[hsl(var(--accent-red-foreground))] !hover:bg-[hsl(var(--accent-red))]/90 disabled:bg-[hsl(var(--accent-red))]/70 disabled:text-[hsl(var(--accent-red-foreground))]/70"
          disabled={(!email && !phone) || !acceptedTerms}
        >
          Get Started
        </Button>
      </form>
    </div>
  );
}
