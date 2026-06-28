import { AlertTriangle, CheckCircle2, Info, Lightbulb } from 'lucide-react'
import type { ReviewCompleteness, ReviewRecommendation } from '../../lib/pekerjaan-review-utils'
import { PuspenBadge } from '../PuspenUi'
import { puspenBorder, puspenLabel, puspenShadowMd } from '../../lib/tokens'

const severityStyles: Record<ReviewRecommendation['severity'], { panel: string; icon: string; badge: 'danger' | 'warning' | 'crt' }> = {
    critical: {
        panel: 'bg-[#FDE2E4]',
        icon: 'text-[#EF233C]',
        badge: 'danger',
    },
    warning: {
        panel: 'bg-[#FFE5D9]',
        icon: 'text-[#FB8500]',
        badge: 'warning',
    },
    info: {
        panel: 'bg-[#8ECAE6]',
        icon: 'text-[#111111]',
        badge: 'crt',
    },
}

function SeverityIcon({ severity }: { severity: ReviewRecommendation['severity'] }) {
    const style = severityStyles[severity]
    if (severity === 'info') {
        return <Info className={`h-4 w-4 shrink-0 ${style.icon}`} />
    }
    return <AlertTriangle className={`h-4 w-4 shrink-0 ${style.icon}`} />
}

type ReviewInsightsPanelProps = {
    completeness: ReviewCompleteness
    recommendations: ReviewRecommendation[]
}

export function ReviewInsightsPanel({ completeness, recommendations }: ReviewInsightsPanelProps) {
    return (
        <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <div className={`bg-white p-4 ${puspenBorder} ${puspenShadowMd}`}>
                <div className="mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#111111]" />
                    <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[#111111]">
                        Skor Kelengkapan Data
                    </h3>
                </div>
                <div className="flex items-end gap-3">
                    <div className="text-5xl font-black text-[#111111]">{completeness.score}</div>
                    <div className="pb-1 text-sm font-bold text-[#111111]/60">/ 100</div>
                </div>
                <div className="mt-4 space-y-2">
                    <CompletenessBar label="Foto" value={completeness.foto} />
                    <CompletenessBar label="Penerima" value={completeness.penerima} />
                    <CompletenessBar label="Progress" value={completeness.progress} />
                    <CompletenessBar label="Koordinat foto" value={completeness.koordinat} />
                </div>
            </div>

            <div className={`bg-white p-4 ${puspenBorder} ${puspenShadowMd}`}>
                <div className="mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-[#111111]" />
                    <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[#111111]">
                        Rekomendasi Tindak Lanjut
                    </h3>
                </div>
                {recommendations.length === 0 ? (
                    <p className="text-sm font-bold text-[#111111]/65">
                        Data pekerjaan terlihat lengkap. Tidak ada rekomendasi prioritas saat ini.
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {recommendations.map((item) => {
                            const style = severityStyles[item.severity]
                            return (
                                <li
                                    key={`${item.severity}-${item.title}`}
                                    className={`flex gap-2 p-3 ${style.panel} ${puspenBorder}`}
                                >
                                    <SeverityIcon severity={item.severity} />
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="text-sm font-black text-[#111111]">{item.title}</div>
                                            <PuspenBadge tone={style.badge}>{item.severity}</PuspenBadge>
                                        </div>
                                        <p className="mt-0.5 text-xs font-bold leading-5 text-[#111111]/75">
                                            {item.detail}
                                        </p>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
        </section>
    )
}

function CompletenessBar({ label, value }: { label: string; value: number }) {
    return (
        <div>
            <div className={`mb-1 flex items-center justify-between ${puspenLabel} text-[#111111]/70`}>
                <span>{label}</span>
                <span>{value}%</span>
            </div>
            <div className={`h-3 overflow-hidden bg-[#FFF7E8] ${puspenBorder}`}>
                <div
                    className="h-full bg-[#2ECC71]"
                    style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
                />
            </div>
        </div>
    )
}