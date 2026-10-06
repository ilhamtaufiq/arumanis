import { useEffect, useState } from 'react'
import type { SpmTargetSetting } from './use-target-setting'
import { CheckCircle2, Flag, Gauge, TriangleAlert } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { SpmProjection } from '@/lib/spm-rekap'
import { formatNumber, formatPercent } from './format'

const TARGET_YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => 2026 + i)

type SpmRekapProyeksiProps = {
    projection: SpmProjection | null
    setting: SpmTargetSetting
    onSettingChange: (setting: SpmTargetSetting) => void
    capaianLabel: string
}

function Stat({ label, value, sub, className }: { label: string; value: string; sub?: string; className?: string }) {
    return (
        <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <p className={cn('truncate text-lg font-bold tabular-nums', className)}>{value}</p>
            {sub ? <p className="truncate text-[11px] text-muted-foreground">{sub}</p> : null}
        </div>
    )
}

export function SpmRekapProyeksi({ projection, setting, onSettingChange, capaianLabel }: SpmRekapProyeksiProps) {
    const [pctInput, setPctInput] = useState(String(setting.targetPercent))

    useEffect(() => {
        setPctInput(String(setting.targetPercent))
    }, [setting.targetPercent])

    const commitPct = () => {
        const value = Number(pctInput.replace(',', '.'))
        if (Number.isFinite(value) && value > 0 && value <= 100) {
            onSettingChange({ ...setting, targetPercent: value })
        } else {
            setPctInput(String(setting.targetPercent))
        }
    }

    const reached = projection != null && projection.remaining <= 0
    const status = !projection
        ? null
        : reached
          ? { tone: 'emerald', icon: CheckCircle2, text: 'Target sudah tercapai' }
          : projection.onTrack
            ? { tone: 'emerald', icon: CheckCircle2, text: 'Sesuai jalur — laju saat ini cukup' }
            : {
                  tone: 'amber',
                  icon: TriangleAlert,
                  text:
                      projection.accelerationFactor != null
                          ? `Perlu percepatan ${projection.accelerationFactor.toLocaleString('id-ID', {
                                maximumFractionDigits: 1,
                            })}× dari laju saat ini`
                          : 'Belum ada tambahan capaian untuk dijadikan laju',
              }

    return (
        <div className="rounded-lg border bg-muted/20 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-violet-600" />
                    <p className="text-sm font-semibold">Target vs Realisasi</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Target cakupan</span>
                    <div className="relative">
                        <Input
                            className="h-8 w-20 pr-6 text-right text-xs"
                            inputMode="decimal"
                            value={pctInput}
                            onChange={(e) => setPctInput(e.target.value)}
                            onBlur={commitPct}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') commitPct()
                            }}
                            aria-label="Target cakupan (persen)"
                        />
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                            %
                        </span>
                    </div>
                    <span className="text-muted-foreground">pada tahun</span>
                    <Select
                        value={String(setting.targetYear)}
                        onValueChange={(v) => onSettingChange({ ...setting, targetYear: Number(v) })}
                    >
                        <SelectTrigger className="h-8 w-[90px] text-xs" aria-label="Tahun target">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {TARGET_YEAR_OPTIONS.map((year) => (
                                <SelectItem key={year} value={String(year)}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {projection ? (
                <>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                        <Stat
                            label={`Realisasi s/d ${projection.lastYear}`}
                            value={formatPercent(projection.currentCoverage, 2)}
                            sub={`${formatNumber(projection.current)} ${capaianLabel}`}
                            className="text-emerald-700 dark:text-emerald-400"
                        />
                        <Stat
                            label="Sisa menuju target"
                            value={`${formatNumber(projection.remaining)} KK`}
                            sub={`Target ${formatNumber(projection.targetKk)} KK (${formatPercent(projection.targetPercent, 0)})`}
                            className="text-amber-700 dark:text-amber-400"
                        />
                        <Stat
                            label={`Kebutuhan per tahun (${projection.yearsLeft} thn tersisa)`}
                            value={`+${formatNumber(projection.requiredPerYear)} KK`}
                            sub={projection.yearsLeft <= 0 ? 'Tahun target sudah lewat/berjalan' : undefined}
                            className="text-violet-700 dark:text-violet-400"
                        />
                        <Stat
                            label={`Laju rata-rata ${projection.averageYears} thn terakhir`}
                            value={`+${formatNumber(projection.averagePerYear)} KK`}
                            sub="per tahun"
                            className="text-sky-700 dark:text-sky-400"
                        />
                        <Stat
                            label="Perkiraan target tercapai"
                            value={projection.estimatedYear != null ? String(projection.estimatedYear) : '—'}
                            sub={projection.estimatedYear == null ? 'Laju saat ini nol' : 'dengan laju rata-rata'}
                        />
                    </div>
                    {status ? (
                        <div
                            className={cn(
                                'mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                                status.tone === 'emerald'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
                            )}
                        >
                            <status.icon className="h-3.5 w-3.5" />
                            {status.text}
                        </div>
                    ) : null}
                </>
            ) : (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Gauge className="h-3.5 w-3.5" />
                    Target KK belum tersedia untuk menghitung proyeksi.
                </p>
            )}
        </div>
    )
}
