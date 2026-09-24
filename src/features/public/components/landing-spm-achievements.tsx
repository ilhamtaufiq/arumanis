import { useState } from 'react'
import { isSpmDetailPageActive, useAppSettings } from '@/features/settings/api'
import type { LandingSpmSector } from '../api/spam-stats'
import { usePublicLocale } from '../i18n/use-public-locale'
import { LandingSpmMap } from './landing-spm-map'
import { LandingSpmMapToolbar } from './landing-spm-map-toolbar'
import { SpmSyncDisclaimer } from './spm-sync-disclaimer'

export function LandingSpmAchievements() {
    const [sector, setSector] = useState<LandingSpmSector>('air_minum')
    const [tahun, setTahun] = useState('')
    const { data: settingsResponse } = useAppSettings()
    const showDetailPage = isSpmDetailPageActive(settingsResponse?.data)
    const { messages } = usePublicLocale()
    const spmCopy = messages.landing.spm
    const copy = spmCopy.sectors[sector]

    return (
        <section
            id="capaian-spm"
            className="border-b-4 border-[#1C1C1C] bg-transparent py-12 lg:py-16"
        >
            <div className="container mx-auto px-6">
                <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
                    <div className="lg:col-span-4 lg:sticky lg:top-28">
                        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[#1C1C1C]/60">
                            {spmCopy.label}
                        </p>
                        <h2 className="mb-3 font-display text-2xl font-bold tracking-tight text-[#1C1C1C] lg:text-3xl">
                            {copy.title}
                        </h2>
                        <p className="text-sm leading-relaxed text-[#1C1C1C]/75">
                            {copy.description}
                        </p>
                        <p className="mt-2 text-xs text-[#1C1C1C]/50">{spmCopy.dataNote}</p>
                        <SpmSyncDisclaimer text={spmCopy.syncDisclaimer} className="mt-5" theme="light" />
                    </div>

                    <div className="lg:col-span-8">
                        <div className="-mx-2 sm:mx-0">
                            <LandingSpmMapToolbar
                                sector={sector}
                                onSectorChange={setSector}
                                tahun={tahun}
                                onTahunChange={setTahun}
                                airMinumLabel={spmCopy.sectors.air_minum.filterLabel}
                                sanitasiLabel={spmCopy.sectors.sanitasi.filterLabel}
                                filterAria={spmCopy.filterAria}
                                viewDetailLabel={spmCopy.viewDetail}
                                showDetailPage={showDetailPage}
                                detailSearch={{
                                    sector,
                                    ...(tahun ? { tahun } : {}),
                                }}
                            />
                            <LandingSpmMap
                                sector={sector}
                                tahun={tahun || undefined}
                                mapLayout="landing"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}