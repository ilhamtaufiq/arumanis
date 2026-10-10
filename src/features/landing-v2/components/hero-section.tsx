
import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { usePublicLocale } from "@/features/public/i18n/use-public-locale";
import { AnchorLink } from "./anchor-link";

// Decorative canvas: load after first paint so it stays off the LCP path
const AnimatedSphere = lazy(() =>
  import("./animated-sphere").then((m) => ({ default: m.AnimatedSphere }))
);

const heroStats = [
  { value: "32", label: "kecamatan terpantau", company: "KAB. CIANJUR" },
  { value: "360", label: "desa & kelurahan", company: "WILAYAH LAYANAN" },
  { value: "12+", label: "modul terintegrasi", company: "ARUMANIS" },
  { value: "1", label: "portal data terpadu", company: "AIR MINUM & SANITASI" },
];

export function HeroSection() {
  const { messages } = usePublicLocale();
  const copy = messages.landing.shell.hero;
  const words = copy.words;
  const reducedMotion = usePrefersReducedMotion();
  const [wordIndex, setWordIndex] = useState(0);
  const [showSphere, setShowSphere] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [reducedMotion, words.length]);

  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setShowSphere(true));
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(() => setShowSphere(true), 200);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Animated sphere background */}
      <div
        aria-hidden="true"
        className="absolute right-[-30%] top-1/2 -translate-y-1/2 w-[420px] h-[420px] sm:right-0 sm:w-[600px] sm:h-[600px] lg:w-[800px] lg:h-[800px] opacity-40 sm:opacity-90 pointer-events-none"
      >
        {showSphere && (
          <Suspense fallback={null}>
            <AnimatedSphere />
          </Suspense>
        )}
      </div>
      
      {/* Subtle grid lines */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-foreground/10"
            style={{
              top: `${12.5 * (i + 1)}%`,
              left: 0,
              right: 0,
            }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-foreground/10"
            style={{
              left: `${8.33 * (i + 1)}%`,
              top: 0,
              bottom: 0,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-32 lg:py-40">
        {/* Eyebrow */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
            <span className="w-8 h-px bg-primary" />
            {copy.eyebrow}
          </span>
        </div>

        {/* Main headline */}
        <div className="mb-12">
          <h1 className="text-[clamp(2.5rem,10vw,10rem)] font-display leading-[0.9] tracking-tight">
            <span className="block">{copy.titleLine}</span>
            <span className="block">
              <Sparkles aria-hidden="true" className="inline-block text-primary w-[0.75em] h-[0.75em] mr-3 align-baseline" />
              <span className="relative inline-block">
                <span className="sr-only">{words[wordIndex]}</span>
                <span
                  key={wordIndex}
                  aria-hidden="true"
                  className="inline-flex"
                >
                  {words[wordIndex].split("").map((char, i) => (
                    <span
                      key={`${wordIndex}-${i}`}
                      className="inline-block animate-char-in"
                      style={{
                        animationDelay: `${i * 50}ms`,
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </span>
                <span className="absolute -bottom-2 left-0 right-0 h-3 bg-primary/25" />
              </span>
            </span>
          </h1>
        </div>

        {/* Description */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-end">
          <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-xl">
            {copy.description}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Button
              size="lg"
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-14 text-base rounded-full group"
            >
              <AnchorLink href="#features">
                {copy.ctaProgram}
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </AnchorLink>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-14 px-8 text-base rounded-full border-foreground/20 hover:bg-foreground/5"
            >
              <Link to="/publikasi">{copy.ctaPublications}</Link>
            </Button>
          </div>
        </div>
        
      </div>
      
      {/* Stats marquee - full width outside container */}
      <div 
        className="absolute bottom-8 sm:bottom-24 left-0 right-0 motion-reduce:static motion-reduce:mt-12 motion-reduce:px-6 motion-reduce:lg:px-12"
      >
        <div className="flex gap-16 marquee whitespace-nowrap motion-reduce:flex-wrap motion-reduce:whitespace-normal motion-reduce:gap-y-6">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              aria-hidden={i === 1 ? "true" : undefined}
              className="flex gap-16 motion-reduce:flex-wrap motion-reduce:gap-x-10 motion-reduce:gap-y-6 motion-reduce:data-[dup=true]:hidden"
              data-dup={i === 1}
            >
              {heroStats.map((stat) => (
                <div key={`${stat.company}-${i}`} className="flex items-baseline gap-4">
                  <span className="text-4xl lg:text-5xl font-display">{stat.value}</span>
                  <span className="text-sm text-muted-foreground">
                    {stat.label}
                    <span className="block font-mono text-xs mt-1">{stat.company}</span>
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
    </section>
  );
}
