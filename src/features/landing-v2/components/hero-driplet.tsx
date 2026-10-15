import { useState } from "react";

// Pet: Driplet oleh ibreeze2017, dari Petdex (petdex.dev/pets/driplet).
// Setiap baris sprite sheet resmi dipakai sebagai satu state animasi.
const DRIPLET_STATES = [0, 1, 2, 3, 4, 5, 6, 7, 8];

interface HeroDripletProps {
  reducedMotion: boolean;
  className?: string;
}

/** Driplet dengan state acak per kunjungan. Pengguna dengan reduced motion melihat frame diam. */
export function HeroDriplet({ reducedMotion, className = "w-[260px] h-auto sm:w-[340px] lg:w-[400px]" }: HeroDripletProps) {
  const [state] = useState(
    () => DRIPLET_STATES[Math.floor(Math.random() * DRIPLET_STATES.length)]
  );

  const src = reducedMotion
    ? "/animations/driplet/driplet-poster.png"
    : `/animations/driplet/driplet-state-${state}.webp`;

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={192}
      height={208}
      className={`h-auto select-none ${className}`}
      draggable={false}
    />
  );
}
