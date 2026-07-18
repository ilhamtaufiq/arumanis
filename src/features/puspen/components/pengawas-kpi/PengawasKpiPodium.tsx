import { motion } from 'motion/react'
import { Crown, Trophy } from 'lucide-react'
import { UserAvatar } from '@/components/shared/UserAvatar'
import type { PengawasKpiItem } from '../../api/pengawas-kpi'
import { getScorePerPekerjaan } from '../../lib/pengawas-kpi-utils'
import { puspenBorder, puspenLabel, puspenShadowMd } from '../../lib/tokens'
import { cn } from '@/lib/utils'

function formatNumber(n: number): string {
    return new Intl.NumberFormat('id-ID').format(n)
}

const podiumStyles = [
    {
        rank: 2,
        order: 'order-2 lg:order-1',
        pedestalH: 'h-16 lg:h-20',
        bg: 'bg-[#C0C0C0]',
        ring: 'ring-[#9CA3AF]',
        medal: '2',
        delay: 0.18,
        y: 36,
    },
    {
        rank: 1,
        order: 'order-1 lg:order-2',
        pedestalH: 'h-24 lg:h-32',
        bg: 'bg-[#FFD700]',
        ring: 'ring-[#EAB308]',
        medal: '1',
        delay: 0.05,
        y: 48,
    },
    {
        rank: 3,
        order: 'order-3',
        pedestalH: 'h-14 lg:h-16',
        bg: 'bg-[#CD7F32]',
        ring: 'ring-[#B45309]',
        medal: '3',
        delay: 0.28,
        y: 28,
    },
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
        <section className={`mb-4 overflow-hidden bg-[#FFFFFF] p-4 sm:p-5 ${puspenBorder} ${puspenShadowMd}`}>
            <motion.div
                className={`mb-5 flex items-center gap-2 ${puspenLabel} text-[#111111]/60`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
            >
                <Trophy className="h-4 w-4" />
                Podium Tiga Teratas
            </motion.div>

            <div className="grid grid-cols-1 items-end gap-4 lg:grid-cols-3 lg:gap-3">
                {ordered.map((item) => {
                    const style = podiumStyles.find((s) => s.rank === item.rank) ?? podiumStyles[1]
                    const isFirst = item.rank === 1
                    const avg = getScorePerPekerjaan(item)

                    return (
                        <motion.button
                            key={item.id}
                            type="button"
                            onClick={() => onSelect(item)}
                            className={cn(
                                style.order,
                                'group relative flex w-full flex-col items-center text-left outline-none',
                            )}
                            initial={{ opacity: 0, y: style.y, scale: 0.92 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{
                                type: 'spring',
                                stiffness: 280,
                                damping: 22,
                                delay: style.delay,
                            }}
                            whileHover={{ y: -4, transition: { duration: 0.15 } }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {/* Avatar + crown */}
                            <div className="relative z-10 mb-2 flex flex-col items-center">
                                {isFirst ? (
                                    <motion.div
                                        className="absolute -top-5 z-20 text-[#B45309]"
                                        initial={{ y: -12, opacity: 0, rotate: -12 }}
                                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                                        transition={{ delay: style.delay + 0.35, type: 'spring', stiffness: 400 }}
                                    >
                                        <Crown
                                            className="h-7 w-7 fill-[#FFD700] stroke-[#111111] stroke-[2.5]"
                                            aria-hidden
                                        />
                                    </motion.div>
                                ) : null}

                                <motion.div
                                    className={cn(
                                        'relative rounded-full border-[3px] border-[#111111] bg-white p-0.5 shadow-[3px_3px_0_0_#111111]',
                                        isFirst && 'ring-4 ring-[#FFD700]/80',
                                        !isFirst && `ring-2 ${style.ring}`,
                                    )}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        delay: style.delay + 0.12,
                                        type: 'spring',
                                        stiffness: 320,
                                        damping: 16,
                                    }}
                                >
                                    {isFirst ? (
                                        <motion.span
                                            className="pointer-events-none absolute inset-0 rounded-full bg-[#FFD700]/25"
                                            animate={{ scale: [1, 1.18, 1], opacity: [0.45, 0, 0.45] }}
                                            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                                            aria-hidden
                                        />
                                    ) : null}
                                    <UserAvatar
                                        id={item.id}
                                        name={item.nama}
                                        avatar={item.avatar}
                                        className={cn(
                                            'border-0',
                                            isFirst ? 'h-20 w-20 sm:h-24 sm:w-24' : 'h-16 w-16 sm:h-20 sm:w-20',
                                        )}
                                        fallbackClassName="bg-[#1A1A2E] text-base font-black text-[#FFB703] sm:text-lg"
                                        alt={item.nama}
                                    />
                                    <span
                                        className={cn(
                                            'absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-[#111111] text-xs font-black text-[#111111] shadow-[2px_2px_0_0_#111111]',
                                            style.bg,
                                        )}
                                        aria-label={`Peringkat ${item.rank}`}
                                    >
                                        {style.medal}
                                    </span>
                                </motion.div>
                            </div>

                            {/* Name card */}
                            <motion.div
                                className={cn(
                                    'relative z-10 mb-0 w-full px-3 pb-2 pt-1 text-center',
                                )}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: style.delay + 0.25 }}
                            >
                                <div
                                    className={cn(
                                        'truncate text-base font-black uppercase tracking-tight text-[#111111] sm:text-lg',
                                        isFirst && 'text-lg sm:text-xl',
                                    )}
                                    title={item.nama}
                                >
                                    {item.nama}
                                </div>
                                {item.nip ? (
                                    <div className="truncate text-[10px] font-bold tracking-[0.1em] text-[#111111]/50">
                                        {item.nip}
                                    </div>
                                ) : null}
                                <div className={`${puspenLabel} mt-1 text-[#111111]/50`}>
                                    {formatNumber(item.pekerjaan_count)} pekerjaan
                                    {(item.quality_packages ?? 0) > 0
                                        ? ` · ${item.quality_packages} ≥70`
                                        : ''}
                                </div>
                            </motion.div>

                            {/* Pedestal rises up */}
                            <motion.div
                                className={cn(
                                    'relative w-full overflow-hidden',
                                    style.pedestalH,
                                    style.bg,
                                    puspenBorder,
                                    puspenShadowMd,
                                )}
                                initial={{ scaleY: 0.15, opacity: 0.6 }}
                                animate={{ scaleY: 1, opacity: 1 }}
                                transition={{
                                    delay: style.delay + 0.08,
                                    type: 'spring',
                                    stiffness: 220,
                                    damping: 18,
                                }}
                                style={{ transformOrigin: 'bottom' }}
                            >
                                {/* Shine sweep */}
                                <motion.div
                                    className="pointer-events-none absolute inset-y-0 w-1/3 skew-x-[-18deg] bg-white/35"
                                    initial={{ left: '-40%' }}
                                    animate={{ left: '120%' }}
                                    transition={{
                                        delay: style.delay + 0.55,
                                        duration: 0.85,
                                        ease: 'easeInOut',
                                    }}
                                    aria-hidden
                                />

                                <div className="relative flex h-full flex-col items-center justify-center gap-0.5 px-2 py-2">
                                    <div className={`${puspenLabel} text-[#111111]/55`}>Rata-rata %</div>
                                    <motion.div
                                        className={cn(
                                            'font-black tabular-nums text-[#111111]',
                                            isFirst ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl',
                                        )}
                                        initial={{ scale: 0.6, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: style.delay + 0.4, type: 'spring' }}
                                    >
                                        {avg.toFixed(1)}
                                    </motion.div>
                                    <div className="text-[10px] font-bold tabular-nums text-[#111111]/55">
                                        Σ {item.score.toFixed(1)}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.button>
                    )
                })}
            </div>
        </section>
    )
}
