import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnchorLink } from "./anchor-link";
import { usePublicLocale } from "@/features/public/i18n/use-public-locale";
import { parseSpmSector } from "@/features/public/lib/spm-sector";

export function DevelopersSection() {
  const { messages } = usePublicLocale();
  const copy = messages.landing.shell.collab;
  const [activeDecision, setActiveDecision] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const decision = copy.decisions[activeDecision];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="developers"
      ref={sectionRef}
      aria-labelledby="developers-heading"
      className="relative py-24 lg:py-32 overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <div
            className={`transition-all duration-700 motion-reduce:transition-none ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-primary" />
              {copy.label}
            </span>
            <h2
              id="developers-heading"
              className="text-4xl lg:text-6xl font-display tracking-tight mb-8"
            >
              {copy.titleLead}
              <br />
              <span className="text-muted-foreground">{copy.titleTail}</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              {copy.description}
            </p>
            <ul className="grid sm:grid-cols-2 gap-6">
              {copy.features.map((feature) => (
                <li key={feature.title}>
                  <h3 className="font-medium mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`lg:sticky lg:top-32 transition-all duration-700 delay-200 motion-reduce:transition-none ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <div className="border border-foreground/10 p-6 sm:p-8 lg:p-10">
              <div className="flex items-center justify-between mb-10">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
                  decision-flow
                </span>
                <span className="text-xs font-mono text-muted-foreground">Arumanis / data</span>
              </div>

              <div
                id="decision-panel"
                role="tabpanel"
                aria-live="polite"
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="border border-foreground/30 rounded-full px-6 py-3 text-sm">
                  {decision.label}
                </div>
                <div className="h-8 w-px bg-foreground/20" aria-hidden="true" />
                <div className="border border-foreground/40 px-7 py-4 font-medium">
                  {decision.detail}
                </div>
                <div className="h-8 w-px bg-foreground/20" aria-hidden="true" />
                <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-4 w-full">
                  <div className="border border-foreground/15 p-4">
                    <span className="block text-xs font-mono text-muted-foreground mb-2">
                      {copy.yes}
                    </span>
                    {decision.yes}
                  </div>
                  <div className="border border-foreground/15 p-4">
                    <span className="block text-xs font-mono text-muted-foreground mb-2">
                      {copy.notYet}
                    </span>
                    {decision.no}
                  </div>
                </div>
              </div>

              <div
                role="tablist"
                aria-label={copy.tabsLabel}
                className="mt-10 pt-5 border-t border-foreground/10 flex gap-2"
              >
                {copy.decisions.map((item, index) => {
                  const active = activeDecision === index;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      aria-controls="decision-panel"
                      onClick={() => setActiveDecision(index)}
                      className="group flex-1 pt-2 pb-1 text-left min-h-11 focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      <span
                        className={`block h-1 mb-2 transition-colors ${
                          active ? "bg-primary" : "bg-foreground/15 group-hover:bg-foreground/30"
                        }`}
                      />
                      <span
                        className={`block text-xs font-mono ${
                          active ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <AnchorLink
                href="#features"
                className="text-foreground hover:underline underline-offset-4"
              >
                {copy.linkModules}
              </AnchorLink>
              <span className="text-foreground/20" aria-hidden="true">
                |
              </span>
              <Link
                to="/capaian-spm"
                search={{ sector: parseSpmSector(undefined), tahun: undefined }}
                className="text-muted-foreground hover:text-primary hover:underline underline-offset-4"
              >
                {copy.linkAchievements}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
