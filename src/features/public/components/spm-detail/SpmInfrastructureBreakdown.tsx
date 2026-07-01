import { motion } from 'motion/react'
import { formatCount } from '../../lib/innovation-stats'
import type { PublicSanitasiStats } from '../../api/spam-stats'
import type { PublicMessages } from '../../i18n/types'

type SpmInfrastructureBreakdownProps = {
    stats: PublicSanitasiStats
    copy: PublicMessages['spmDetail']['infrastructure']
}

export function SpmInfrastructureBreakdown({ stats, copy }: SpmInfrastructureBreakdownProps) {
    const items = [
        { key: 'spaldt', label: copy.spaldt, value: stats.spaldt_count, color: 'from-cyan-400 to-blue-500' },
        { key: 'spalds', label: copy.spalds, value: stats.spalds_count, color: 'from-teal-400 to-emerald-500' },
        { key: 'iplt', label: copy.iplt, value: stats.iplt_count, color: 'from-violet-400 to-purple-500' },
        { key: 'mck_individu', label: copy.mckIndividu, value: stats.mck_individu_count, color: 'from-amber-400 to-orange-500' },
        { key: 'mck_komunal', label: copy.mckKomunal, value: stats.mck_komunal_count, color: 'from-rose-400 to-pink-500' },
    ]

    const maxValue = Math.max(...items.map((item) => item.value), 1)

    return (
        <div className="rounded-2xl border border-white/15 bg-black/20 p-5 shadow-xl shadow-black/20 backdrop-blur-sm sm:p-6">
            <div className="mb-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/45">{copy.title}</p>
                <p className="mt-1 text-sm text-white/60">{copy.subtitle}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {items.map((item, index) => (
                    <motion.div
                        key={item.key}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.4, delay: index * 0.06 }}
                        whileHover={{ scale: 1.02 }}
                        className="group rounded-xl border border-emerald-400/15 bg-emerald-950/20 px-4 py-4 transition-colors hover:border-emerald-400/30 hover:bg-emerald-950/30"
                    >
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100/55">
                            {item.label}
                        </p>
                        <p className="mt-2 text-xl font-medium text-white">{formatCount(item.value)}</p>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                            <motion.div
                                className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                                initial={{ width: 0 }}
                                whileInView={{ width: `${(item.value / maxValue) * 100}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                            />
                        </div>
                        <p className="mt-2 text-[10px] text-white/40 opacity-0 transition-opacity group-hover:opacity-100">
                            {((item.value / stats.total_count) * 100).toFixed(1)}% dari total
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}