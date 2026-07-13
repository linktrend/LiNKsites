'use client';

import { LegalPageLayout } from '@/components/layouts/LegalPageLayout';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Home, Mail } from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

export default function FormConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string || 'en';
  
  // Get form type from URL params (e.g., contact, signup, newsletter)
  const formType = searchParams.get('type') || 'form';
  const email = searchParams.get('email') || '';

  const getConfirmationMessage = () => {
    switch (formType) {
      case 'contact':
        return {
          title: 'Message Sent Successfully',
          message: 'Thank you for contacting us! We\'ve received your message and will get back to you as soon as possible.',
          details: 'Our team typically responds within 24-48 hours during business days.'
        };
      case 'signup':
        return {
          title: 'Account Created Successfully',
          message: 'Welcome to LTM Starter Kit! Your account has been created successfully.',
          details: 'Please check your email to verify your account and get started.'
        };
      case 'newsletter':
        return {
          title: 'Subscribed Successfully',
          message: 'Thank you for subscribing to our newsletter!',
          details: 'You\'ll receive our latest updates, news, and exclusive content directly to your inbox.'
        };
      default:
        return {
          title: 'Form Submitted Successfully',
          message: 'Thank you! Your form has been submitted successfully.',
          details: 'We\'ve received your information and will process it accordingly.'
        };
    }
  };

  const confirmation = getConfirmationMessage();

  return (
    <LegalPageLayout
      title={confirmation.title}
      subtitle="Your submission has been received"
    >
      <div className="text-center py-12 max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-500" />
          </div>
          
          <p className="text-xl text-muted-foreground mb-4">
            {confirmation.message}
          </p>
          
          <p className="text-base text-muted-foreground">
            {confirmation.details}
          </p>

          {email && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg inline-flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{email}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            onClick={() => router.push(`/${locale}`)}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Button>
          
          {formType === 'contact' && (
            <Button
              onClick={() => router.push(`/${locale}/help-center`)}
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
            >
              Visit Help Center
            </Button>
          )}

          {formType === 'signup' && (
            <Button
              onClick={() => router.push(`/${locale}/dashboard`)}
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
            >
              Go to Dashboard
            </Button>
          )}
        </div>

        <div className="mt-12 pt-8 border-t">
          <h3 className="text-lg font-semibold mb-4">What&apos;s Next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-4 rounded-lg bg-muted/30">
              <h4 className="font-semibold mb-2">Explore Platform</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Discover all the features and capabilities we offer.
              </p>
              <a href={`/${locale}/platform`} className="text-sm text-primary hover:underline">
                Learn More →
              </a>
            </div>
            
            <div className="p-4 rounded-lg bg-muted/30">
              <h4 className="font-semibold mb-2">View Resources</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Access our library of guides, tutorials, and documentation.
              </p>
              <a href={`/${locale}/resources`} className="text-sm text-primary hover:underline">
                Browse Resources →
              </a>
            </div>
            
            <div className="p-4 rounded-lg bg-muted/30">
              <h4 className="font-semibold mb-2">Get Support</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Need help? Our support team is here to assist you.
              </p>
              <a href={`/${locale}/help-center`} className="text-sm text-primary hover:underline">
                Get Help →
              </a>
            </div>
          </div>
        </div>
      </div>
    </LegalPageLayout>
  );
}

