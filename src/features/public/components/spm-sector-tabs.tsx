import type { ReactNode } from 'react'
import { Droplets, Recycle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LandingSpmSector } from '../api/spam-stats'

type SpmSectorTabsProps = {
    sector: LandingSpmSector
    onSectorChange: (sector: LandingSpmSector) => void
    airMinumLabel: string
    sanitasiLabel: string
    ariaLabel: string
    className?: string
}

export function SpmSectorTabs({
    sector,
    onSectorChange,
    airMinumLabel,
    sanitasiLabel,
    ariaLabel,
    className,
}: SpmSectorTabsProps) {
    return (
        <div
            className={cn(
                'inline-flex rounded-full border border-white/15 bg-slate-950/50 p-1 shadow-lg shadow-black/20 backdrop-blur-sm',
                className,
            )}
            role="tablist"
            aria-label={ariaLabel}
        >
            <SectorTabButton
                active={sector === 'air_minum'}
                onClick={() => onSectorChange('air_minum')}
                icon={<Droplets className="h-4 w-4" />}
                label={airMinumLabel}
            />
            <SectorTabButton
                active={sector === 'sanitasi'}
                onClick={() => onSectorChange('sanitasi')}
                icon={<Recycle className="h-4 w-4" />}
                label={sanitasiLabel}
            />
        </div>
    )
}

function SectorTabButton({
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