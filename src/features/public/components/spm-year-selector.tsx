import { PUBLIC_SPM_TAHUN_OPTIONS } from '../lib/spm-year'
import { usePublicLocale } from '../i18n/use-public-locale'
import type { LandingSpmSector } from '../api/spam-stats'

type SpmYearSelectorProps = {
    sector: LandingSpmSector
    value?: string
    onChange: (tahun: string) => void
    className?: string
    variant?: 'default' | 'compact'
}

export function SpmYearSelector({
    sector,
    value,
    onChange,
    className,
    variant = 'default',
}: SpmYearSelectorProps) {
    const { messages } = usePublicLocale()
    const copy =
        sector === 'sanitasi'
            ? messages.landing.spm.sanitasiYearFilter
            : messages.landing.spm.yearFilter

    const isCompact = variant === 'compact'

    return (
        <label
            className={
                className ??
                (isCompact
                    ? 'inline-flex min-w-0 items-center gap-2'
                    : 'inline-flex flex-col gap-1')
            }
        >
            <span
                className={
                    isCompact
                        ? 'shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-white/45'
                        : 'text-[10px] font-bold uppercase tracking-[0.18em] text-white/45'
                }
            >
                {copy.label}
            </span>
            <select
                value={value ?? 'all'}
                onChange={(event) => onChange(event.target.value === 'all' ? '' : event.target.value)}
                aria-label={copy.aria}
                className={
                    isCompact
                        ? 'h-8 min-w-0 max-w-[11.5rem] flex-1 truncate rounded-lg border border-white/15 bg-slate-950/80 px-2 text-xs text-white outline-none transition-colors hover:border-white/25 focus:border-cyan-300/40 focus:ring-1 focus:ring-cyan-300/30 sm:max-w-[13rem]'
                        : 'h-8 min-w-[148px] rounded-lg border border-white/15 bg-slate-950/80 px-2.5 text-xs text-white outline-none transition-colors hover:border-white/25 focus:border-cyan-300/40 focus:ring-1 focus:ring-cyan-300/30'
                }
            >
                <option value="all">{copy.all}</option>
                {PUBLIC_SPM_TAHUN_OPTIONS.map((year) => (
                    <option key={year} value={year}>
                        {copy.year.replace('{year}', year)}
                    </option>
                ))}
            </select>
        </label>
    )
}