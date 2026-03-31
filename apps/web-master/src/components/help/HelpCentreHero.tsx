import { getFallbackImage } from "@/lib/imageFallback";

interface HelpCentreHeroProps {
  title: string;
  subtitle: string;
}

export function HelpCentreHero({ title, subtitle }: HelpCentreHeroProps) {
  return (
    <section
      id="help-hero"
      className="relative bg-cover bg-center"
      data-cms-section="hero"
      style={{ backgroundImage: `url(${getFallbackImage('hero')})` }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Hero Content */}
      <div className="relative z-10 container px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-white"
            data-cms-field="hero.title"
          >
            {title}
          </h1>
          <p
            className="text-lg sm:text-xl text-white/90"
            data-cms-field="hero.subtitle"
          >
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
