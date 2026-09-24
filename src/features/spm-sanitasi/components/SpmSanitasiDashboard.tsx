import {
    Building2,
    Droplets,
    TrendingUp,
    Users,
    Wallet,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatNumber } from '@/features/dashboard/lib/format'
import type { SpmSanitasiStats } from '@/features/spm-sanitasi/types'

interface SpmSanitasiDashboardProps {
    stats?: SpmSanitasiStats
    isLoading: boolean
    tahun?: string
}

export function SpmSanitasiDashboard({ stats, isLoading, tahun }: SpmSanitasiDashboardProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} className="h-28 animate-pulse bg-muted/40" />
                ))}
            </div>
        )
    }

    const statsData = stats ?? {
        coverage_kk_percentage: 0,
        target_kk: 0,
        total_pemanfaat_kk: 0,
        total_pemanfaat_jiwa: 0,
        total_count: 0,
        berfungsi_count: 0,
        total_investasi: 0,
        desa_with_infrastruktur: 0,
        total_penduduk: 0,
        gap_kk: 0,
        gap_jiwa: 0,
    }

    const coverage = statsData.coverage_kk_percentage ?? 0
    const targetKk = statsData.target_kk ?? 0
    const pemanfaatKk = statsData.total_pemanfaat_kk ?? 0
    const pemanfaatJiwa = statsData.total_pemanfaat_jiwa ?? 0
    const totalUnits = statsData.total_count ?? 0
    const berfungsiCount = statsData.berfungsi_count ?? 0
    const totalInvestasi = statsData.total_investasi ?? 0
    const desaLayanan = statsData.desa_with_infrastruktur ?? 0
    const gapKk = statsData.gap_kk ?? Math.max(0, targetKk - pemanfaatKk)
    const gapJiwa = statsData.gap_jiwa ?? Math.max(0, (statsData.total_penduduk ?? 0) - pemanfaatJiwa)

    return (
        <div className="space-y-4">
            {tahun ? (
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                        Tahun konstruksi: {tahun}
                    </Badge>
                </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Card className="flex flex-row items-center space-x-4 p-6 shadow-sm">
                    <div className="rounded-lg bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Infrastruktur</p>
                        <h3 className="text-xl font-bold">{totalUnits}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {berfungsiCount} berfungsi
                        </p>
                    </div>
                </Card>

                <Card className="flex flex-row items-center space-x-4 p-6 shadow-sm">
                    <div className="rounded-lg bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/30">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Pemanfaat</p>
                        <h3 className="text-xl font-bold">
                            {formatNumber(pemanfaatKk)} KK
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {formatNumber(pemanfaatJiwa)} jiwa
                        </p>
                    </div>
                </Card>

                <Card className="flex flex-row items-center space-x-4 p-6 shadow-sm">
                    <div className="rounded-lg bg-violet-100 p-3 text-violet-600 dark:bg-violet-900/30">
                        <Wallet className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Investasi</p>
                        <h3 className="text-xl font-bold">
                            {formatCurrency(totalInvestasi)}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {formatNumber(desaLayanan)} desa terlayani
                        </p>
                    </div>
                </Card>

                <Card className="flex flex-row items-center space-x-4 p-6 shadow-sm">
                    <div className="rounded-lg bg-amber-100 p-3 text-amber-600 dark:bg-amber-900/30">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Target KK</p>
                        <h3 className="text-xl font-bold">
                            {formatNumber(targetKk)} KK
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {statsData.total_penduduk != null ? `${formatNumber(statsData.total_penduduk)} penduduk` : ''}
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
                            <span className="text-xl font-bold">{coverage.toFixed(1)}%</span>
                            <span className="text-[10px] text-muted-foreground">
                                target {formatNumber(targetKk)} KK
                            </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                                className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                                style={{ width: `${Math.min(coverage, 100)}%` }}
                            />
                        </div>
                        {gapKk > 0 && (
                            <p className="mt-2 text-[10px] text-amber-600">
                                Belum terlayani: +{formatNumber(gapKk)} KK
                            </p>
                        )}
                    </div>
                </Card>
            </div>

            {gapKk > 0 || gapJiwa > 0 ? (
                <Card className="p-6 shadow-sm">
                    <div className="mb-1 flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold">Gap Capaian</h3>
                    </div>
                    <p className="mb-4 text-xs text-muted-foreground">
                        Selisih antara target dan pemanfaat terdata dari infrastruktur SPM Sanitasi.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border bg-slate-50/50 p-3 dark:bg-slate-900/50">
                            <p className="text-xs font-medium text-muted-foreground">Gap KK</p>
                            <p className="mt-1 text-lg font-bold text-amber-600">
                                +{formatNumber(gapKk)} KK
                            </p>
                            <p className="mt-1 text-[10px] text-muted-foreground">
                                Target {formatNumber(targetKk)} KK - Pemanfaat {formatNumber(pemanfaatKk)} KK
                            </p>
                        </div>
                        <div className="rounded-lg border bg-slate-50/50 p-3 dark:bg-slate-900/50">
                            <p className="text-xs font-medium text-muted-foreground">Gap Jiwa</p>
                            <p className="mt-1 text-lg font-bold text-amber-600">
                                +{formatNumber(gapJiwa)} jiwa
                            </p>
                            <p className="mt-1 text-[10px] text-muted-foreground">
                                Penduduk {formatNumber(statsData.total_penduduk ?? 0)} - Pemanfaat {formatNumber(pemanfaatJiwa)} jiwa
                            </p>
                        </div>
                    </div>
                </Card>
            ) : null}
        </div>
    )
}
