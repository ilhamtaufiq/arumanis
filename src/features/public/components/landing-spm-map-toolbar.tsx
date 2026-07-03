import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import type { LandingSpmSector } from '../api/spam-stats'
import { SpmSectorTabs } from './spm-sector-tabs'
import { SpmYearSelector } from './spm-year-selector'

type LandingSpmMapToolbarProps = {
    sector: LandingSpmSector
    onSectorChange: (sector: LandingSpmSector) => void
    tahun?: string
    onTahunChange: (tahun: string) => void
    airMinumLabel: string
    sanitasiLabel: string
    filterAria: string
    viewDetailLabel?: string
    showDetailPage?: boolean
    detailSearch?: { sector: LandingSpmSector; tahun?: string }
}

export function LandingSpmMapToolbar({
    sector,
    onSectorChange,
    tahun,
    onTahunChange,
    airMinumLabel,
    sanitasiLabel,
    filterAria,
    viewDetailLabel,
    showDetailPage,
    detailSearch,
}: LandingSpmMapToolbarProps) {
    return (
        <div className="landing-spm-map-toolbar mb-3 flex flex-col gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-3 backdrop-blur-md sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <SpmSectorTabs
                sector={sector}
                onSectorChange={onSectorChange}
                airMinumLabel={airMinumLabel}
                sanitasiLabel={sanitasiLabel}
                ariaLabel={filterAria}
                className="w-full justify-center sm:w-auto"
            />
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end sm:gap-3">
                <SpmYearSelector
                    sector={sector}
                    value={tahun}
                    onChange={onTahunChange}
                    variant="compact"
                />
                {showDetailPage && viewDetailLabel ? (
                    <Link
                        to="/capaian-spm"
                        search={detailSearch}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-white/20"
                    >
                        {viewDetailLabel}
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                ) : null}
            </div>
        </div>
    )
}