import { useQuery } from '@tanstack/react-query'
import {
    Building2,
    Droplets,
    GitCompare,
    Link2,
    TrendingUp,
    UserCheck,
    Users,
} from 'lucide-react'
import { getSpamUnitStats } from '../api'
import { Card } from '@/components/ui/card'
import { getManualScopeLabel } from '../lib/manual-scope'
import type { UnitSpamStats } from '../types'

interface SpamUnitDashboardProps {
    kecamatanId?: number
    tahun?: string
    variant?: 'full' | 'kpi-only'
}

function CompareStat({
    label,
    manual,
    derived,
    manualLabel,
    suffix = '',
}: {
    label: string
    manual?: number
    derived?: number
    manualLabel: string
    suffix?: string
}) {
    const manualVal = manual ?? 0
    const derivedVal = derived ?? 0

    return (
        <div className="rounded-lg border bg-slate-50/50 p-3 dark:bg-slate-900/50">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <div className="mt-2 flex items-end justify-between gap-2">
                <div>
                    <p className="text-[10px] uppercase text-muted-foreground">{manualLabel}</p>
                    <p className="text-sm font-bold">
                        {manualVal.toLocaleString('id-ID')}
                        {suffix}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase text-muted-foreground">Pekerjaan</p>
                    <p className="text-sm font-bold text-emerald-600">
                        {derivedVal.toLocaleString('id-ID')}
                        {suffix}
                    </p>
                </div>
            </div>
        </div>
    )
}

export function SpamUnitDashboard({
    kecamatanId,
    tahun,
    variant = 'full',
}: SpamUnitDashboardProps) {
    const { data: statsData, isLoading } = useQuery({
        queryKey: ['spam-units-stats', kecamatanId, tahun],
        queryFn: () =>
            getSpamUnitStats({
                kecamatan_id: kecamatanId,
                tahun: tahun || undefined,
            }),
        staleTime: 0,
    })

    const stats = statsData?.data as UnitSpamStats | undefined

    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} className="h-28 animate-pulse bg-muted/40" />
                ))}
            </div>
        )
    }

    if (!stats) return null

    const manualScopeLabel = stats.manual_scope_label ?? getManualScopeLabel(tahun)
    const displaySR = stats.manual_sr ?? stats.total_sr
    const displayKK = stats.manual_kk ?? stats.total_kk
    const displayJiwa = stats.manual_jiwa ?? stats.total_jiwa

    const integrationTotal =
        (stats.matched_count ?? 0) +
        (stats.partial_count ?? 0) +
        (stats.no_unit_count ?? 0) +
        (stats.no_pekerjaan_count ?? 0)

    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Card className="flex flex-row items-center space-x-4 p-6 shadow-sm">
                    <div className="rounded-lg bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Unit SPAM</p>
                        <h3 className="text-xl font-bold">{stats.total_units} Unit</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {stats.simspam_count} SIMSPAM | {stats.non_simspam_count} Std
                        </p>
                    </div>
                </Card>

                <Card className="flex flex-row items-center space-x-4 p-6 shadow-sm">
                    <div className="rounded-lg bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-900/30">
                        <Droplets className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total SR (JP)</p>
                        <h3 className="text-xl font-bold">{displaySR.toLocaleString()} SR</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Manual {manualScopeLabel} · Target: {stats.total_target.toLocaleString()}
                        </p>
                    </div>
                </Card>

                <Card className="flex flex-row items-center space-x-4 p-6 shadow-sm">
                    <div className="rounded-lg bg-cyan-100 p-3 text-cyan-600 dark:bg-cyan-900/30">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total KK (BJP)</p>
                        <h3 className="text-xl font-bold">{stats.total_bjp_kk.toLocaleString()} KK</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            JP: {displayKK.toLocaleString()} KK
                        </p>
                    </div>
                </Card>

                <Card className="flex flex-row items-center space-x-4 p-6 shadow-sm">
                    <div className="rounded-lg bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/30">
                        <UserCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Jiwa</p>
                        <h3 className="text-xl font-bold">
                            {(displayJiwa + stats.total_bjp_jiwa).toLocaleString()} Jiwa
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Pekerjaan AM: {stats.pekerjaan_air_minum_count ?? 0}
                        </p>
                    </div>
                </Card>

                <Card className="flex flex-col justify-between p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">Cakupan SPM</p>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="mt-2">
                        <div className="mb-1 flex items-baseline justify-between">
                            <span className="text-xl font-bold">{stats.coverage_percentage}%</span>
                            <span className="text-[10px] text-muted-foreground">
                                {tahun
                                    ? `Tahun ${tahun}`
                                    : manualScopeLabel}
                            </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                                className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                                style={{ width: `${Math.min(stats.coverage_percentage, 100)}%` }}
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {variant === 'kpi-only' ? null : (
            <div className="grid gap-4 lg:grid-cols-2">
                <Card className="p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <GitCompare className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold">Manual vs Derived (Agregat)</h3>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <CompareStat
                            label="SR"
                            manual={stats.manual_sr}
                            derived={stats.derived_sr}
                            manualLabel={manualScopeLabel}
                        />
                        <CompareStat
                            label="KK"
                            manual={stats.manual_kk}
                            derived={stats.derived_kk}
                            manualLabel={manualScopeLabel}
                        />
                        <CompareStat
                            label="Jiwa"
                            manual={stats.manual_jiwa}
                            derived={stats.derived_jiwa}
                            manualLabel={manualScopeLabel}
                        />
                        <CompareStat
                            label="Nilai Kontrak"
                            manual={stats.manual_nilai_kontrak}
                            derived={stats.derived_nilai_kontrak}
                            manualLabel={manualScopeLabel}
                        />
                    </div>
                </Card>

                <Card className="p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold">Status Integrasi Wilayah</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
                            <p className="text-2xl font-bold text-emerald-600">{stats.matched_count ?? 0}</p>
                            <p className="text-xs text-muted-foreground">Matched</p>
                        </div>
                        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-center">
                            <p className="text-2xl font-bold text-amber-600">{stats.partial_count ?? 0}</p>
                            <p className="text-xs text-muted-foreground">Partial</p>
                        </div>
                        <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3 text-center">
                            <p className="text-2xl font-bold text-orange-600">{stats.no_unit_count ?? 0}</p>
                            <p className="text-xs text-muted-foreground">Tanpa Unit</p>
                        </div>
                        <div className="rounded-lg border border-slate-500/20 bg-slate-500/5 p-3 text-center">
                            <p className="text-2xl font-bold text-slate-600">{stats.no_pekerjaan_count ?? 0}</p>
                            <p className="text-xs text-muted-foreground">Tanpa Pekerjaan</p>
                        </div>
                    </div>
                    {integrationTotal > 0 && (
                        <p className="mt-3 text-xs text-muted-foreground">
                            {Math.round(((stats.matched_count ?? 0) / integrationTotal) * 100)}% desa
                            terintegrasi penuh dari {integrationTotal} desa
                        </p>
                    )}
                </Card>
            </div>
            )}
        </div>
    )
}