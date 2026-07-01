import { Trophy } from 'lucide-react'
import type { PengawasKpiItem } from '../../api/pengawas-kpi'
import { getScorePerPekerjaan } from '../../lib/pengawas-kpi-utils'
import { puspenBorder, puspenLabel, puspenShadowMd } from '../../lib/tokens'

function formatNumber(n: number): string {
    return new Intl.NumberFormat('id-ID').format(n)
}

const podiumStyles = [
    { order: 'order-2 lg:order-1', height: 'min-h-[168px]', bg: 'bg-[#C0C0C0]', medal: '#2' },
    { order: 'order-1 lg:order-2', height: 'min-h-[200px]', bg: 'bg-[#FFD700]', medal: '#1' },
    { order: 'order-3', height: 'min-h-[152px]', bg: 'bg-[#CD7F32]', medal: '#3' },
] as const

type PengawasKpiPodiumProps = {
    items: PengawasKpiItem[]
    onSelect: (item: PengawasKpiItem) => void
}

export function PengawasKpiPodium({ items, onSelect }: PengawasKpiPodiumProps) {
    const topThree = items.filter((item) => item.rank <= 3).sort((a, b) => a.rank - b.rank)

    if (topThree.length === 0) return null

    const ordered = [
        topThree.find((item) => item.rank === 2),
        topThree.find((item) => item.rank === 1),
        topThree.find((item) => item.rank === 3),
    ].filter(Boolean) as PengawasKpiItem[]

    return (
        <section className={`mb-4 bg-[#FFFFFF] p-4 sm:p-5 ${puspenBorder} ${puspenShadowMd}`}>
            <div className={`mb-4 flex items-center gap-2 ${puspenLabel} text-[#111111]/60`}>
                <Trophy className="h-4 w-4" />
                Tiga Teratas
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:items-end">
                {ordered.map((item, index) => {
                    const style = podiumStyles[index]
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onSelect(item)}
                            className={`${style.order} ${style.height} flex w-full flex-col justify-between ${style.bg} p-4 text-left ${puspenBorder} ${puspenShadowMd} transition hover:brightness-105`}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-2xl font-black">{style.medal}</span>
                                <span className={`${puspenLabel} text-[#111111]/60`}>
                                    {formatNumber(item.pekerjaan_count)} pekerjaan
                                </span>
                            </div>
                            <div>
                                <div className="text-lg font-black uppercase tracking-tight text-[#111111]">
                                    {item.nama}
                                </div>
                                {item.nip ? (
                                    <div className="text-[10px] font-bold tracking-[0.1em] text-[#111111]/50">
                                        {item.nip}
                                    </div>
                                ) : null}
                            </div>
                            <div className="mt-3 flex items-end justify-between gap-2">
                                <div>
                                    <div className={`${puspenLabel} text-[#111111]/55`}>Skor Rata-rata</div>
                                    <div className="text-2xl font-black tabular-nums text-[#111111]">
                                        {getScorePerPekerjaan(item).toFixed(1)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`${puspenLabel} text-[#111111]/55`}>Total</div>
                                    <div className="text-sm font-black tabular-nums text-[#111111]">
                                        {item.score.toFixed(1)}
                                    </div>
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>
        </section>
    )
}