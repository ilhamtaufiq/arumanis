import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import type { LandingSpmSector } from '../api/spam-stats'
import { usePublicLocale } from '../i18n/use-public-locale'
import { LandingSpmMap } from './landing-spm-map'
import { SpmSectorTabs } from './spm-sector-tabs'
import { SpmSyncDisclaimer } from './spm-sync-disclaimer'

export function LandingSpmAchievements() {
    const [sector, setSector] = useState<LandingSpmSector>('air_minum')
    const { messages } = usePublicLocale()
    const spmCopy = messages.landing.spm
    const copy = spmCopy.sectors[sector]

    return (
        <section id="capaian-spm" className="border-b border-white/10 bg-transparent py-16 lg:py-20">
            <div className="container mx-auto px-6">
                <div className="mx-auto mb-8 max-w-3xl text-center">
                    <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
                        {spmCopy.label}
                    </p>
                    <h2 className="mb-4 text-3xl font-medium tracking-tight text-white lg:text-4xl">
                        {copy.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-white/75 lg:text-base">
                        {copy.description} {spmCopy.dataNote}
                    </p>
                    <SpmSyncDisclaimer text={spmCopy.syncDisclaimer} className="mx-auto mt-6 max-w-2xl" />
                </div>

                <div className="mb-6 flex flex-col items-center gap-4">
                    <SpmSectorTabs
                        sector={sector}
                        onSectorChange={setSector}
                        airMinumLabel={spmCopy.sectors.air_minum.filterLabel}
                        sanitasiLabel={spmCopy.sectors.sanitasi.filterLabel}
                        ariaLabel={spmCopy.filterAria}
                    />
                    <Link
                        to="/capaian-spm"
                        search={{ sector }}
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-all hover:bg-white/20"
                    >
                        {spmCopy.viewDetail}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                </div>

                <LandingSpmMap sector={sector} />
            </div>
        </section>
    )
}