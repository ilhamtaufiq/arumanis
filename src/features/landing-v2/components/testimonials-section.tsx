import { useLandingCopy } from "../i18n";

import { useCallback, useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { copy } = useLandingCopy();
  const testimonials = copy.testimonials.items;
  const [isPaused, setIsPaused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const autoRotate = !reducedMotion && !isPaused && !isHovering;

  const goTo = useCallback((next: (prev: number) => number) => {
    if (reducedMotion) {
      setActiveIndex(next);
      return;
    }
    setIsAnimating(true);
    setTimeout(() => {
      setActiveIndex(next);
      setIsAnimating(false);
    }, 300);
  }, [reducedMotion]);

  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => goTo((prev) => (prev + 1) % testimonials.length), 5000);
    return () => clearInterval(interval);
  }, [autoRotate, goTo]);

  const activeTestimonial = testimonials[activeIndex];

  return (
    <section
      aria-label={copy.testimonials.ariaLabel}
      className="relative py-32 lg:py-40 border-t border-foreground/10 lg:pb-14"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onFocus={() => setIsHovering(true)}
      onBlur={() => setIsHovering(false)}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Label */}
        <div className="flex items-center gap-4 mb-16">
          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            {copy.testimonials.label}
          </span>
          <div className="flex-1 h-px bg-foreground/10" />
          <span className="font-mono text-xs text-muted-foreground">
            {String(activeIndex + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
          </span>
        </div>

        {/* Main Quote */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-8" aria-live={autoRotate ? "off" : "polite"}>
            <blockquote
              className={`transition-all duration-300 ${
                isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
              }`}
            >
              <p className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-foreground">
                "{activeTestimonial.quote}"
              </p>
            </blockquote>

            {/* Author */}
            <div
              className={`mt-12 flex items-center gap-6 transition-all duration-300 delay-100 ${
                isAnimating ? "opacity-0" : "opacity-100"
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center">
                <span className="font-display text-2xl text-foreground">
                  {activeTestimonial.author.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">{activeTestimonial.author}</p>
                <p className="text-muted-foreground">
                  {activeTestimonial.role}, {activeTestimonial.company}
                </p>
              </div>
            </div>
          </div>

          {/* Metric Highlight */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <div
              className={`p-8 border border-foreground/10 transition-all duration-300 ${
                isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
              }`}
            >
              <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase block mb-4">
                {copy.testimonials.result}
              </span>
              <p className="font-display text-3xl md:text-4xl text-foreground">
                {activeTestimonial.metric}
              </p>
            </div>

            {/* Navigation Dots */}
            <div className="flex items-center gap-1 mt-8">
              {!reducedMotion && (
                <button
                  type="button"
                  onClick={() => setIsPaused((p) => !p)}
                  aria-label={isPaused ? copy.testimonials.play : copy.testimonials.pause}
                  className="mr-3 flex h-11 w-11 items-center justify-center rounded-full border border-foreground/15 text-foreground/70 hover:text-foreground"
                >
                  {isPaused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
                </button>
              )}
              {testimonials.map((item, idx) => (
                <button
                  key={item.author}
                  type="button"
                  onClick={() => goTo(() => idx)}
                  aria-label={copy.testimonials.showQuote(idx + 1, testimonials.length, item.author)}
                  aria-current={idx === activeIndex ? "true" : undefined}
                  className="group flex h-11 items-center px-1"
                >
                  <span
                    className={`block h-2 transition-all duration-300 ${
                      idx === activeIndex
                        ? "w-8 bg-primary"
                        : "w-2 bg-foreground/20 group-hover:bg-foreground/40"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Company Logos Marquee Label */}
        <div className="mt-24 pt-12 border-t border-foreground/10">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase mb-8 text-center">
            {copy.testimonials.support}
          </p>
        </div>
      </div>
      
      {/* Full-width marquee outside container */}
      <div className="w-full" aria-hidden="true">
        <div className="flex gap-16 items-center marquee">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex gap-16 items-center shrink-0">
              {copy.testimonials.marquee.map(
                (company) => (
                  <span
                    key={`${setIdx}-${company}`}
                    className="font-display text-xl md:text-2xl text-foreground/30 whitespace-nowrap hover:text-foreground transition-colors duration-300"
                  >
                    {company}
                  </span>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
