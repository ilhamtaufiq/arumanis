import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { formatCount, formatCoverage } from '../../lib/innovation-stats'
import { getCoverageTier } from '../../lib/spm-map-coverage'
import type { SpmDesaRow } from '../../lib/spm-desa-table'
import type { LandingSpmSector } from '../../api/spam-stats'
import type { PublicMessages } from '../../i18n/types'

type SpmDesaDetailCardProps = {
    row: SpmDesaRow | null
    sector: LandingSpmSector
    copy: PublicMessages['spmDetail']['detailCard']
    mapCopy: PublicMessages['landing']['spm']['map']
    onClose: () => void
}

export function SpmDesaDetailCard({
    row,
    sector,
    copy,
    mapCopy,
    onClose,
}: SpmDesaDetailCardProps) {
    const tier = row ? getCoverageTier(row.coverage) : 'none'

    return (
        <AnimatePresence>
            {row ? (
                <motion.div
                    key={row.desa_id}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="mx-auto mt-4 max-w-3xl rounded-2xl border border-white/20 bg-slate-950/80 p-4 shadow-xl shadow-black/30 backdrop-blur-md sm:p-5"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                                {copy.selected}
                            </p>
                            <h3 className="mt-1 text-lg font-medium text-white">{row.desa}</h3>
                            <p className="text-sm text-white/60">Kec. {row.kecamatan}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">
                                {mapCopy.tiers[tier]}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white"
                                aria-label={copy.close}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <StatPill label="Capaian" value={`${formatCoverage(row.coverage)}%`} accent />
                        <StatPill label="Target KK" value={formatCount(row.target)} />
                        <StatPill
                            label={sector === 'sanitasi' ? 'KK pemanfaat' : 'KK terlayani'}
                            value={formatCount(row.kk)}
                        />
                        <StatPill label="Jiwa" value={formatCount(row.jiwa)} />
                        {sector === 'sanitasi' && row.sector === 'sanitasi' ? (
                            <StatPill label="Penduduk" value={formatCount(row.penduduk)} />
                        ) : row.sector === 'air_minum' ? (
                            <StatPill label="SR" value={formatCount(row.sr)} />
                        ) : null}
                        <StatPill
                            label={sector === 'sanitasi' ? 'Infrastruktur' : 'Unit SPAM'}
                            value={formatCount(row.unit_count)}
                        />
                        <StatPill
                            label={copy.gapKk}
                            value={formatCount(Math.max(0, row.target - row.kk))}
                        />
                    </div>

                    <div className="mt-4">
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, row.coverage)}%` }}
                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            />
                        </div>
                    </div>

                </motion.div>
            ) : (
                <motion.p
                    key="hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mx-auto mt-4 max-w-xl text-center text-xs text-white/50"
                >
                    {copy.clickHint}
                </motion.p>
            )}
        </AnimatePresence>
    )
}

function StatPill({
    label,
    value,
    accent,
}: {
    label: string
    value: string
    accent?: boolean
}) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">{label}</p>
            <p className={accent ? 'mt-1 text-lg font-semibold text-emerald-300' : 'mt-1 text-sm font-medium text-white'}>
                {value}
            </p>
        </div>
    )
}