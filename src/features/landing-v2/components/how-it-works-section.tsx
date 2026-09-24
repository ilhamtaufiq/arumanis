
import { useEffect, useRef, useState } from "react";

const steps = [
  { number: "I", title: "Rencanakan program", description: "Susun kegiatan, pekerjaan, target, dan anggaran air minum serta sanitasi berdasarkan kebutuhan wilayah.", flow: "Kebutuhan wilayah", result: "Rencana program" },
  { number: "II", title: "Kelola pelaksanaan", description: "Pantau kontrak, output, penerima manfaat, berkas, foto lapangan, dan checklist dalam satu portal.", flow: "Pelaksanaan kegiatan", result: "Output terverifikasi" },
  { number: "III", title: "Awasi dan evaluasi", description: "Gunakan dashboard, PUSPEN, panel pengawasan, dan metrik capaian untuk menjaga program tetap akuntabel.", flow: "Data & pengawasan", result: "Capaian terukur" },
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsVisible(true); }, { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setActiveStep((prev) => (prev + 1) % steps.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const active = steps[activeStep];

  return (
    <section id="how-it-works" ref={sectionRef} className="landing-band-dark relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"><div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 40px, currentColor 40px, currentColor 41px)" }} /></div>
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-background/50 mb-6"><span className="w-8 h-px bg-primary" />Alur layanan</span>
          <h2 className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>Tiga langkah.<br /><span className="text-background/50">Dampak yang nyata.</span></h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          <div className="space-y-0">
            {steps.map((step, index) => (
              <button key={step.number} type="button" onClick={() => setActiveStep(index)} className={`w-full text-left py-8 border-b border-background/10 transition-all duration-500 group ${activeStep === index ? "opacity-100" : "opacity-40 hover:opacity-70"}`}>
                <div className="flex items-start gap-6"><span className="font-display text-3xl text-background/30">{step.number}</span><div className="flex-1"><h3 className="text-2xl lg:text-3xl font-display mb-3 group-hover:translate-x-2 transition-transform duration-300">{step.title}</h3><p className="text-background/60 leading-relaxed">{step.description}</p>{activeStep === index && <div className="mt-4 h-px bg-background/20 overflow-hidden"><div className="h-full bg-primary w-0" style={{ animation: "landing-progress 5s linear forwards" }} /></div>}</div></div>
              </button>
            ))}
          </div>
          <div className="lg:sticky lg:top-32 self-start border border-background/10 p-8 lg:p-10">
            <div className="flex items-center justify-between mb-10"><span className="text-xs font-mono uppercase tracking-[0.2em] text-background/40">flowchart.ts</span><span className="text-xs font-mono text-background/40">Arumanis / {activeStep + 1}.0</span></div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="rounded-full border border-background/30 px-6 py-3 text-sm">{active.flow}</div>
              <div className="h-8 w-px bg-background/30" />
              <div className="flex items-center gap-3"><span className="h-px w-12 bg-background/30" /><span className="text-background/40">proses Arumanis</span><span className="h-px w-12 bg-background/30" /></div>
              <div className="h-8 w-px bg-background/30" />
              <div className="border border-background/50 px-8 py-4 text-sm font-medium">{active.result}</div>
            </div>
            <div className="mt-10 border-t border-background/10 pt-4 flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><span className="text-xs font-mono text-background/40">Alur aktif dan terpantau</span></div>
          </div>
        </div>
      </div>
      <style>{`@keyframes landing-progress { from { width: 0%; } to { width: 100%; } }`}</style>
    </section>
  );
}
