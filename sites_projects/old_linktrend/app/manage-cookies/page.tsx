'use client';

import { LegalPageLayout } from '@/components/layouts/LegalPageLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { Cookie, Save } from 'lucide-react';
import { useLocalePath } from '@/hooks/useLocalePath';

export default function ManageCookiesPage() {
  const [preferences, setPreferences] = useState({
    necessary: true, // Always enabled
    functional: true,
    analytics: false,
    marketing: false,
  });

  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof typeof preferences) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setSaved(false);
  };

  const handleSave = () => {
    // TODO: Save preferences to localStorage or cookie
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    setSaved(true);
    
    // Show saved message for 3 seconds
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    setPreferences(onlyNecessary);
    localStorage.setItem('cookiePreferences', JSON.stringify(onlyNecessary));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const { buildPath } = useLocalePath();

  return (
    <LegalPageLayout
      title="Manage Cookie Preferences"
      subtitle="Control how we use cookies on this website"
    >
      <div className="py-8">
        <div className="mb-8 p-6 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-4">
            <Cookie className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-2">About Cookies</h3>
              <p className="text-muted-foreground">
                We use cookies and similar technologies to help personalize content, tailor and measure ads, 
                and provide a better experience. By clicking accept, you agree to this, as outlined in our Cookie Policy.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-8">
          {/* Necessary Cookies */}
          <div className="p-6 border rounded-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Necessary Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  These cookies are essential for the website to function properly. They enable basic functions 
                  like page navigation and access to secure areas. The website cannot function properly without these cookies.
                </p>
              </div>
              <Switch
                checked={preferences.necessary}
                disabled={true}
                className="ml-4"
                aria-label="Necessary cookies (always enabled)"
              />
            </div>
            <p className="text-xs text-muted-foreground italic">
              Always Active - Cannot be disabled
            </p>
          </div>

          {/* Functional Cookies */}
          <div className="p-6 border rounded-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Functional Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  These cookies enable enhanced functionality and personalization, such as language preferences 
                  and user interface customizations. They may be set by us or by third-party providers.
                </p>
              </div>
              <Switch
                checked={preferences.functional}
                onCheckedChange={() => handleToggle('functional')}
                className="ml-4"
                aria-label="Toggle functional cookies"
              />
            </div>
          </div>

          {/* Analytics Cookies */}
          <div className="p-6 border rounded-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Analytics Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  These cookies help us understand how visitors interact with our website by collecting and 
                  reporting information anonymously. This helps us improve our website&apos;s performance and user experience.
                </p>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={() => handleToggle('analytics')}
                className="ml-4"
                aria-label="Toggle analytics cookies"
              />
            </div>
          </div>

          {/* Marketing Cookies */}
          <div className="p-6 border rounded-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Marketing Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  These cookies are used to track visitors across websites. The intention is to display ads 
                  that are relevant and engaging for individual users, thereby making them more valuable for publishers and advertisers.
                </p>
              </div>
              <Switch
                checked={preferences.marketing}
                onCheckedChange={() => handleToggle('marketing')}
                className="ml-4"
                aria-label="Toggle marketing cookies"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t">
          <Button
            onClick={handleSave}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Save className="mr-2 h-5 w-5" />
            {saved ? 'Preferences Saved!' : 'Save Preferences'}
          </Button>
          
          <Button
            onClick={handleAcceptAll}
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
          >
            Accept All
          </Button>
          
          <Button
            onClick={handleRejectAll}
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
          >
            Reject All
          </Button>
        </div>

        {saved && (
          <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg text-center">
            Your cookie preferences have been saved successfully.
          </div>
        )}

        <div className="mt-12 pt-8 border-t">
          <h3 className="text-lg font-semibold mb-4">More Information</h3>
          <p className="text-sm text-muted-foreground mb-4">
            For more information about how we use cookies and process your personal data, please read our:
          </p>
          <div className="flex flex-wrap gap-4">
            <a href={buildPath('/privacy')} className="text-primary hover:underline">
              Privacy Policy
            </a>
            <a href={buildPath('/terms')} className="text-primary hover:underline">
              Terms and Conditions
            </a>
          </div>
        </div>
      </div>
    </LegalPageLayout>
  );
}
