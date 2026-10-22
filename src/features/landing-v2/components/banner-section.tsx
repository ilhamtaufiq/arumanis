/** Banner gambar di bawah hero: petugas lapangan dengan jaringan air minum dan MCK. */
export function BannerSection() {
  return (
    <section aria-label="Ilustrasi program Arumanis" className="relative px-6 lg:px-12 py-16 lg:py-24">
      <div className="mx-auto max-w-[1400px] overflow-hidden rounded-3xl border border-border shadow-sm">
        <img
          src="/images/hero-arumanis.webp"
          alt="Petugas lapangan memantau jaringan air minum dan fasilitas MCK sambil membuka dashboard digital"
          width={1280}
          height={720}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
      </div>
    </section>
  )
}
