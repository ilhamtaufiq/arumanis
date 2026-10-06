import { useLandingCopy } from "../i18n";

import { useEffect, useRef, useState } from "react";
import { AnchorLink } from "./anchor-link";

export function DevelopersSection() {
  const [activeDecision, setActiveDecision] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const { copy } = useLandingCopy();
  const { decisions, features } = copy.developers;
  const decision = decisions[activeDecision];

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsVisible(true); }, { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="developers" ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12"><div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
        <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6"><span className="w-8 h-px bg-primary" />{copy.developers.eyebrow}</span>
          <h2 className="text-4xl lg:text-6xl font-display tracking-tight mb-8">{copy.developers.title}<br /><span className="text-muted-foreground">{copy.developers.titleMuted}</span></h2>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">{copy.developers.description}</p>
          <div className="grid grid-cols-2 gap-6">{features.map((feature) => <div key={feature.title}><h3 className="font-medium mb-1">{feature.title}</h3><p className="text-sm text-muted-foreground">{feature.description}</p></div>)}</div>
        </div>
        <div className={`lg:sticky lg:top-32 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
          <div className="border border-foreground/10 p-8 lg:p-10"><div className="flex items-center justify-between mb-10"><span className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">decision-flow</span><span className="text-xs font-mono text-muted-foreground">Arumanis / data</span></div>
            <div className="flex flex-col items-center text-center gap-3"><div className="border border-foreground/30 rounded-full px-6 py-3 text-sm">{decision.label}</div><div className="h-8 w-px bg-foreground/20" /><div className="border border-foreground/40 px-7 py-4 font-medium">{decision.detail}</div><div className="h-8 w-px bg-foreground/20" /><div className="grid grid-cols-2 gap-4 w-full"><div className="border border-foreground/15 p-4"><span className="block text-xs font-mono text-muted-foreground mb-2">{copy.developers.yes}</span>{decision.yes}</div><div className="border border-foreground/15 p-4"><span className="block text-xs font-mono text-muted-foreground mb-2">{copy.developers.no}</span>{decision.no}</div></div></div>
            <div className="mt-10 pt-5 border-t border-foreground/10 flex gap-2">{decisions.map((item, index) => <button key={item.label} type="button" aria-label={`${copy.developers.showFlow} ${item.label}`} onClick={() => setActiveDecision(index)} className={`h-1 flex-1 transition-colors ${activeDecision === index ? "bg-primary" : "bg-foreground/15"}`} />)}</div>
          </div>
          <div className="mt-6 flex items-center gap-6 text-sm"><AnchorLink href="#features" className="text-foreground hover:underline underline-offset-4">{copy.developers.linkModules}</AnchorLink><span className="text-foreground/20">|</span><a href="https://github.com/ilhamtaufiq/arumanis" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">{copy.developers.linkRepo}</a></div>
        </div>
      </div></div>
    </section>
  );
}
