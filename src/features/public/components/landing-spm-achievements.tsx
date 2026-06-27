import { useState, type ReactNode } from 'react'
import { Droplets, Recycle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LandingSpmSector } from '../api/spam-stats'
import { LandingSpmMap } from './landing-spm-map'

const SECTOR_COPY: Record<
    LandingSpmSector,
    { title: string; description: string; filterLabel: string }
> = {
    air_minum: {
        filterLabel: 'Air Minum',
        title: 'Sebaran Capaian SPM Air Minum Kabupaten Cianjur',
        description:
            'Peta interaktif capaian layanan air minum per desa. Klik wilayah untuk melihat SR, KK, jiwa terlayani, target, dan jumlah unit SPAM.',
    },
    sanitasi: {
        filterLabel: 'Sanitasi',
        title: 'Sebaran Capaian SPM Sanitasi Kabupaten Cianjur',
        description:
            'Peta interaktif capaian layanan sanitasi per desa. Klik wilayah untuk melihat KK pemanfaat, target, jiwa terlayani, dan infrastruktur SPALD/MCK.',
    },
}

export function LandingSpmAchievements() {
    const [sector, setSector] = useState<LandingSpmSector>('air_minum')
    const copy = SECTOR_COPY[sector]

    return (
        <section id="capaian-spm" className="border-b border-white/10 bg-transparent py-16 lg:py-20">
            <div className="container mx-auto px-6">
                <div className="mx-auto mb-8 max-w-3xl text-center">
                    <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
                        Capaian Publik
                    </p>
                    <h2 className="mb-4 text-3xl font-medium tracking-tight text-white lg:text-4xl">
                        {copy.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-white/75 lg:text-base">
                        {copy.description} Data diperbarui dari basis data Arumanis.
                    </p>
                </div>

                <div className="mb-6 flex justify-center">
                    <div
                        className="inline-flex rounded-full border border-white/15 bg-slate-950/50 p-1 shadow-lg shadow-black/20 backdrop-blur-sm"
                        role="tablist"
                        aria-label="Filter capaian SPM"
                    >
                        <SectorFilterButton
                            active={sector === 'air_minum'}
                            onClick={() => setSector('air_minum')}
                            icon={<Droplets className="h-4 w-4" />}
                            label={SECTOR_COPY.air_minum.filterLabel}
                        />
                        <SectorFilterButton
                            active={sector === 'sanitasi'}
                            onClick={() => setSector('sanitasi')}
                            icon={<Recycle className="h-4 w-4" />}
                            label={SECTOR_COPY.sanitasi.filterLabel}
                        />
                    </div>
                </div>

                <LandingSpmMap sector={sector} />
            </div>
        </section>
    )
}

function SectorFilterButton({
    active,
    onClick,
    icon,
    label,
}: {
    active: boolean
    onClick: () => void
    icon: ReactNode
    label: string
}) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={active}
            onClick={onClick}
            className={cn(
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
                active
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-white/70 hover:bg-white/10 hover:text-white',
            )}
        >
            {icon}
            {label}
        </button>
    )
}