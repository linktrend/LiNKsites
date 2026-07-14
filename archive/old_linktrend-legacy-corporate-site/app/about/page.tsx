import { FeaturePageLayout } from '@/components/layouts/FeaturePageLayout';
import Link from 'next/link';
import { AppWindow, Server, Smartphone, BarChart } from 'lucide-react';
import { buildLocalePath } from '@/lib/locale';

interface PageProps {
  params: { locale: string };
}

export default function AboutPage({ params }: PageProps) {
  const localized = (path: string) => buildLocalePath(params?.locale, path);
  return (
    <FeaturePageLayout
      title="About Us"
      subtitle="We design, build, and scale intelligent products that automate work, amplify creativity, and connect ideas to results."
      featureSection1b={
        <div className="bg-gradient-to-r from-[hsl(var(--primary))]/10 to-[hsl(var(--accent))]/10 rounded-lg p-8">
          <p className="text-center text-muted-foreground">
            {/* Placeholder for company timeline or milestone visualization */}
            Our journey from startup to industry leader
          </p>
        </div>
      }
      mainContent={
        <div className="space-y-16">
          {/* Introduction */}
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold mb-6">Who We Are</h2>
            <p className="text-muted-foreground text-lg mb-8">
              LiNKtrend Media is a technology company dedicated to creating, launching, and marketing next-generation applications. Our mission is simple: build smarter tools that empower people and businesses to do more with less effort.
            </p>
            <h2 className="text-3xl font-bold mb-6">Our Philosophy</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Every product we create begins with an AI-first mindset. We treat artificial intelligence as the foundation for better design, faster execution, and more meaningful user experiences. Innovation is not a department here — it is the default setting.
            </p>
          </div>

          {/* What We Do */}
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold mb-6">What We Do</h2>
            <p className="text-muted-foreground text-lg mb-8">
              <strong className="font-semibold">Serial App Development</strong><br/>
              We build, iterate, and launch multiple SaaS and mobile applications in parallel — each designed to solve specific challenges in productivity, marketing, or automation.
            </p>
            <p className="text-muted-foreground text-lg mb-8">
              <strong className="font-semibold">AI-Powered Systems</strong><br/>
              Our platforms integrate advanced AI models for prediction, personalization, and intelligent automation, turning data into actionable outcomes.
            </p>
            <p className="text-muted-foreground text-lg mb-8">
              <strong className="font-semibold">Content and Marketing Automation</strong><br/>
              We connect technology with storytelling. Every product we release is supported by automated marketing systems that scale reach, relevance, and brand impact.
            </p>
            <p className="text-muted-foreground text-lg mb-8">
              <strong className="font-semibold">Creative Partnerships</strong><br/>
              We collaborate with forward-thinking founders and companies that want to move faster, test smarter, and grow with the help of AI.
            </p>
          </div>

          {/* Our Story */}
          <div className="bg-muted/30 p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground text-lg mb-8">
                Our journey began in 2018 when a group of visionaries came together with a shared belief in the power of technology to transform industries. From our humble beginnings as a small team of developers, we have grown into a diverse and innovative company that is committed to pushing the boundaries of what&apos;s possible.
              </p>
              <p className="text-muted-foreground text-lg mb-8">
                We started by focusing on building scalable, AI-powered platforms that could handle complex data processing and deliver real-time insights. Over time, we expanded our capabilities to include full-stack development, mobile app development, and content creation.
              </p>
              <p className="text-muted-foreground text-lg mb-8">
                Today, we are proud to have a portfolio of over 50 applications across various industries, serving millions of users globally. Our success is a testament to our unwavering commitment to quality, innovation, and customer satisfaction.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12 bg-muted/30 rounded-lg px-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Completed Projects</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">2M+</div>
              <div className="text-muted-foreground">Users Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-muted-foreground">Client Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      }
      featureSection3a={null}
      textSection3b={
        <div className="flex flex-col h-full">
          <div>
            <h3 className="text-2xl font-semibold mb-4">Let’s Build Together</h3>
            <p className="text-muted-foreground mb-4">
              We are always developing new public and private applications that push the limits of what’s possible with AI. Whether you are looking to create your next product, automate your operations, or join our team, we would love to connect.
            </p>
          </div>
          <div className="mt-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="https://linktrend.media/" target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">
                Contact Us →
              </Link>
              <Link href="https://linktrend.media/" target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">
                View Open Roles →
              </Link>
            </div>
          </div>
        </div>
      }
    />
  );
}
