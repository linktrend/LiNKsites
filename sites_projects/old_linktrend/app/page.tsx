import { DynamicBgSection } from '@/components/sections/DynamicBgSection';
import { SocialProofCarousel } from '@/components/sections/SocialProofCarousel';
import { SignupHero } from '@/components/sections/SignupHero';
import { ScrollIndicator } from '@/components/sections/ScrollIndicator';
import { PlatformFeatures } from '@/components/sections/PlatformFeatures';
import { PricingPreview } from '@/components/sections/PricingPreview';
import { CTASection } from '@/components/sections/CTASection';
import { SolutionsOverview } from '@/components/sections/SolutionsOverview';

export default function Homepage() {
  return (
    <div className="flex flex-col">
      {/* Above the Fold Section */}
      <DynamicBgSection>
        <div className="container mx-auto px-8 py-4 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center min-h-[600px] text-white">
            {/* Social Proof Carousel - 66% LEFT */}
                      <div className="lg:col-span-2 rounded-lg p-6 flex flex-col items-center justify-center h-[400px] w-full">
                        <SocialProofCarousel />
                      </div>
            {/* Signup Hero - 33% RIGHT */}
            <div className="lg:col-span-1 rounded-lg p-6 flex flex-col justify-center">
              <SignupHero />
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="mt-16">
            <ScrollIndicator />
          </div>
        </div>
      </DynamicBgSection>

      {/* Below the Fold - Bottom 1: Platform Features + Pricing */}
      <section id="platform-features" className="bg-muted/30 pt-8 pb-8 md:pt-16 md:pb-16">
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:items-stretch">
            {/* Platform Features - 66% */}
            <div className="lg:col-span-2 flex">
              <div className="flex-1">
                <PlatformFeatures />
              </div>
            </div>

            {/* Pricing Preview - 33% */}
            <div className="lg:col-span-1 flex">
              <div className="flex-1">
                <PricingPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Below the Fold - Bottom 2: CTA + Solutions */}
      <section className="pt-8 md:pt-12 pb-16 md:pb-24">
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* CTA Section - 33% */}
            <div className="lg:col-span-1">
              <CTASection />
            </div>

            {/* Solutions Overview - 66% */}
            <div className="lg:col-span-2">
              <SolutionsOverview />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
