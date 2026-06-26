import { LandingSpmMap } from './landing-spm-map'

export function LandingSpmAchievements() {
    return (
        <section id="capaian-spm" className="py-16 lg:py-20 border-b border-white/10 bg-transparent">
            <div className="container mx-auto px-6">
                <div className="mb-10 max-w-3xl mx-auto text-center">
                    <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
                        Capaian Publik
                    </p>
                    <h2 className="mb-4 text-3xl font-medium tracking-tight text-white lg:text-4xl">
                        Sebaran Capaian SPM Kabupaten Cianjur
                    </h2>
                    <p className="text-sm leading-relaxed text-white/75 lg:text-base">
                        Peta interaktif capaian layanan air minum per desa. Klik wilayah untuk melihat SR, KK,
                        jiwa terlayani, target, dan jumlah unit SPAM. Data diperbarui dari basis data Arumanis.
                    </p>
                </div>
                <LandingSpmMap />
            </div>
        </section>
    )
}