import { formatCount } from '../../lib/innovation-stats'
import type { PublicSanitasiStats } from '../../api/spam-stats'
import type { PublicMessages } from '../../i18n/types'

type SpmInfrastructureBreakdownProps = {
    stats: PublicSanitasiStats
    copy: PublicMessages['spmDetail']['infrastructure']
}

export function SpmInfrastructureBreakdown({ stats, copy }: SpmInfrastructureBreakdownProps) {
    const items = [
        { label: copy.spaldt, value: stats.spaldt_count },
        { label: copy.spalds, value: stats.spalds_count },
        { label: copy.iplt, value: stats.iplt_count },
        { label: copy.mckIndividu, value: stats.mck_individu_count },
        { label: copy.mckKomunal, value: stats.mck_komunal_count },
    ]

    return (
        <div className="rounded-2xl border border-white/15 bg-black/20 p-5 shadow-xl shadow-black/20 backdrop-blur-sm sm:p-6">
            <div className="mb-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/45">{copy.title}</p>
                <p className="mt-1 text-sm text-white/60">{copy.subtitle}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {items.map((item) => (
                    <div
                        key={item.label}
                        className="rounded-xl border border-emerald-400/15 bg-emerald-950/20 px-4 py-4"
                    >
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100/55">
                            {item.label}
                        </p>
                        <p className="mt-2 text-xl font-medium text-white">{formatCount(item.value)}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}