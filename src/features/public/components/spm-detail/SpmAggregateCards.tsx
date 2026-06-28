import { formatCount, formatCoverage } from '../../lib/innovation-stats'
import type { PublicAirMinumMetrics } from '../../lib/spm-public-stats'
import type { PublicSanitasiStats } from '../../api/spam-stats'
import type { UnitSpamStats } from '@/features/spam-unit/types'
import type { LandingSpmSector } from '../../api/spam-stats'
import type { PublicMessages } from '../../i18n/types'

type SpmAggregateCardsProps = {
    sector: LandingSpmSector
    unitStats?: UnitSpamStats
    airMetrics?: PublicAirMinumMetrics | null
    sanitasiStats?: PublicSanitasiStats
    desaTotal: number
    desaWithCapaian: number
    kecamatan: number
    scopeLabel: string
    copy: PublicMessages['spmDetail']['aggregate']
}

export function SpmAggregateCards({
    sector,
    unitStats,
    airMetrics,
    sanitasiStats,
    desaTotal,
    desaWithCapaian,
    kecamatan,
    scopeLabel,
    copy,
}: SpmAggregateCardsProps) {
    if (sector === 'sanitasi' && sanitasiStats) {
        const cards = [
            {
                label: copy.sanitasi.coverageJiwa,
                value: `${formatCoverage(sanitasiStats.coverage_percentage)}%`,
                hint: `${formatCount(sanitasiStats.total_pemanfaat_kk)} / ${formatCount(sanitasiStats.target_kk)} KK`,
            },
            {
                label: copy.sanitasi.coverageKk,
                value: `${formatCoverage(sanitasiStats.coverage_kk_percentage)}%`,
                hint: copy.sanitasi.coverageKkHint,
            },
            {
                label: copy.sanitasi.jiwaPemanfaat,
                value: formatCount(sanitasiStats.total_pemanfaat_jiwa),
                hint: `${formatCount(sanitasiStats.total_penduduk)} ${copy.sanitasi.penduduk}`,
            },
            {
                label: copy.sanitasi.infrastruktur,
                value: formatCount(sanitasiStats.total_count),
                hint: `${formatCount(sanitasiStats.berfungsi_count)} ${copy.sanitasi.berfungsi}`,
            },
            {
                label: copy.sanitasi.desa,
                value: `${formatCount(desaWithCapaian)} / ${formatCount(desaTotal)}`,
                hint: `${formatCount(sanitasiStats.desa_without_infrastruktur)} ${copy.sanitasi.belumAda}`,
            },
            {
                label: copy.sanitasi.wilayah,
                value: formatCount(kecamatan),
                hint: copy.sanitasi.kecamatan,
            },
        ]

        return (
            <AggregateGrid
                title={copy.sanitasi.title}
                scopeLabel={scopeLabel}
                cards={cards}
            />
        )
    }

    const cards =
        unitStats && airMetrics
            ? [
                  {
                      label: copy.airMinum.coverage,
                      value: `${formatCoverage(airMetrics.coverage)}%`,
                      hint: `${formatCount(airMetrics.totalKk)} / ${formatCount(airMetrics.totalTarget)} KK`,
                  },
                  {
                      label: copy.airMinum.jiwa,
                      value: formatCount(airMetrics.totalJiwa),
                      hint: `${formatCount(airMetrics.totalSr)} SR`,
                  },
                  {
                      label: copy.airMinum.unitSpam,
                      value: formatCount(airMetrics.totalUnits),
                      hint: `${formatCount(airMetrics.simspamCount)} SIMSPAM · ${formatCount(airMetrics.nonSimspamCount)} non-SIMSPAM`,
                  },
                  {
                      label: copy.airMinum.bjp,
                      value: formatCount(airMetrics.totalBjpKk),
                      hint: `${formatCount(airMetrics.totalBjpJiwa)} jiwa BJP`,
                  },
                  {
                      label: copy.airMinum.desa,
                      value: `${formatCount(desaWithCapaian)} / ${formatCount(desaTotal)}`,
                      hint: copy.airMinum.desaHint,
                  },
                  {
                      label: copy.airMinum.achievement,
                      value: formatCount(airMetrics.achievementRecords),
                      hint: `${formatCount(kecamatan)} ${copy.airMinum.kecamatan}`,
                  },
              ]
            : []

    return (
        <AggregateGrid
            title={copy.airMinum.title}
            scopeLabel={scopeLabel}
            cards={cards}
        />
    )
}

function AggregateGrid({
    title,
    scopeLabel,
    cards,
}: {
    title: string
    scopeLabel: string
    cards: Array<{ label: string; value: string; hint?: string }>
}) {
    return (
        <div className="rounded-2xl border border-white/15 bg-black/20 p-5 shadow-xl shadow-black/20 backdrop-blur-sm sm:p-6">
            <div className="mb-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/45">{title}</p>
                <p className="mt-1 text-sm text-white/60">{scopeLabel}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => (
                    <div
                        key={card.label}
                        className="rounded-xl border border-white/10 bg-slate-950/45 px-4 py-4"
                    >
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                            {card.label}
                        </p>
                        <p className="mt-2 text-2xl font-medium tracking-tight text-white">{card.value}</p>
                        {card.hint ? <p className="mt-1 text-xs text-white/55">{card.hint}</p> : null}
                    </div>
                ))}
            </div>
        </div>
    )
}