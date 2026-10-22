import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { HeroDriplet } from "./hero-driplet";

/** Driplet melayang di kanan bawah saat halaman di-scroll. */
export function FloatingDriplet() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-6 right-6 z-40 hidden lg:block"
    >
      <HeroDriplet reducedMotion={reducedMotion} className="w-[200px] h-auto" />
    </div>
  );
}
