
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { usePublicLocale } from "@/features/public/i18n/use-public-locale";
import { AnchorLink } from "./anchor-link";


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

  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [reducedMotion, words.length]);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Ilustrasi program sebagai background hero, dengan gradien agar judul dan tombol tetap terbaca */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <img
          src="/images/hero-arumanis.webp"
          alt=""
          width={1280}
          height={720}
          decoding="async"
          fetchPriority="high"
          className="h-full w-full object-cover object-[75%_center] lg:object-right dark:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background/95 lg:bg-gradient-to-r lg:from-background lg:from-35% lg:via-background/85 lg:via-60% lg:to-background/0" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background via-background/70 to-transparent" />
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
      
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 pt-28 pb-32 lg:pt-32 lg:pb-48">
        {/* Eyebrow */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
            <span className="w-8 h-px bg-primary" />
            {copy.eyebrow}
          </span>
        </div>

        {/* Main headline */}
        <div className="mb-12">
          {/* Ukuran juga dibatasi tinggi layar supaya tombol CTA tetap terlihat di laptop 768px */}
          <h1 className="text-[clamp(2.5rem,min(10vw,14vh),10rem)] font-display leading-[0.9] tracking-tight">
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
