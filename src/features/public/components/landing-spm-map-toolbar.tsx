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
        <div className="landing-spm-map-toolbar mb-3 flex flex-col gap-3 rounded-sm border-2 border-[#1C1C1C] bg-white brutal-shadow px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <SpmSectorTabs
                sector={sector}
                onSectorChange={onSectorChange}
                airMinumLabel={airMinumLabel}
                sanitasiLabel={sanitasiLabel}
                ariaLabel={filterAria}
                className="w-full justify-center sm:w-auto"
                variant="light"
            />
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end sm:gap-3">
                <SpmYearSelector
                    sector={sector}
                    value={tahun}
                    onChange={onTahunChange}
                    variant="compact"
                    theme="light"
                />
                {showDetailPage && viewDetailLabel ? (
                    <Link
                        to="/capaian-spm"
                        search={detailSearch}
                        className="inline-flex h-8 items-center gap-1.5 rounded-sm border-2 border-[#1C1C1C] bg-[#FCE954] px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1C1C1C] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                    >
                        {viewDetailLabel}
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                ) : null}
            </div>
        </div>
    )
}