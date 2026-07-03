import { useQuery } from '@tanstack/react-query'
import {
    Building2,
    Droplets,
    GitCompare,
    Link2,
    Package,
    TrendingUp,
    Users,
} from 'lucide-react'
import { getSpamUnitStats } from '../api'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getManualScopeLabel } from '../lib/manual-scope'
import { getBaselinePolicyLabel, getIntegrasiScopeLabel, SPAM_ACCUMULATION_START_TAHUN } from '../lib/baseline'
import type { UnitSpamStats } from '../types'

interface SpamUnitDashboardProps {
    kecamatanId?: number
    tahun?: string
    variant?: 'full' | 'kpi-only'
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value)
}

function MetricRow({
    label,
    capaian,
    potensi,
    suffix = '',
}: {
    label: string
    capaian: number
    potensi: number
    suffix?: string
}) {
    const selisih = potensi - capaian
    const hasGap = selisih !== 0

    return (
        <div className="rounded-lg border bg-slate-50/50 p-3 dark:bg-slate-900/50">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                    <p className="text-[10px] uppercase text-muted-foreground">Capaian integrasi di unit</p>
                    <p className="text-sm font-bold">
                        {capaian.toLocaleString('id-ID')}
                        {suffix}
                    </p>
                </div>
                <div>
                    <p className="text-[10px] uppercase text-muted-foreground">Potensi pekerjaan</p>
                    <p className="text-sm font-bold text-emerald-600">
                        {potensi.toLocaleString('id-ID')}
                        {suffix}
                    </p>
                </div>
            </div>
            {hasGap && (
                <p className="mt-2 text-xs text-amber-600">
                    Belum tercatat: {selisih > 0 ? '+' : ''}
                    {selisih.toLocaleString('id-ID')}
                    {suffix} — tautkan paket pekerjaan atau input capaian manual
                </p>
            )}
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

    const ringkasan = stats.ringkasan
    const scopeLabel = ringkasan?.scope_label ?? stats.manual_scope_label ?? getManualScopeLabel(tahun)

    const capaianSr = ringkasan?.capaian.sr ?? stats.capaian_sr ?? stats.manual_sr ?? stats.total_sr
    const capaianKk = ringkasan?.capaian.kk ?? stats.capaian_kk ?? stats.manual_kk ?? stats.total_kk
    const capaianJiwa = ringkasan?.capaian.jiwa ?? stats.capaian_jiwa ?? stats.manual_jiwa ?? stats.total_jiwa

    const paketTertaut = ringkasan?.integrasi.paket_tertaut ?? stats.linked_pekerjaan_count ?? 0
    const paketTersedia = ringkasan?.integrasi.paket_tersedia ?? stats.pekerjaan_air_minum_count ?? 0
    const paketBelumTertaut = ringkasan?.integrasi.paket_belum_tertaut ?? stats.paket_belum_tertaut ?? 0
    const unitDenganTautan = ringkasan?.integrasi.unit_dengan_tautan ?? stats.linked_units_count ?? 0

    const spm = ringkasan?.spm
    const coverage = spm?.coverage_percentage ?? stats.coverage_percentage
    const targetKk = spm?.target_kk ?? stats.total_target

    const capaianIntegrasiSr =
        ringkasan?.capaian_integrasi?.sr ?? stats.capaian_integrasi_sr ?? 0
    const capaianIntegrasiKk =
        ringkasan?.capaian_integrasi?.kk ?? stats.capaian_integrasi_kk ?? 0
    const capaianIntegrasiJiwa =
        ringkasan?.capaian_integrasi?.jiwa ?? stats.capaian_integrasi_jiwa ?? 0
    const capaianIntegrasiKontrak =
        ringkasan?.capaian_integrasi?.nilai_kontrak ?? stats.capaian_integrasi_nilai_kontrak ?? 0

    const potensiSr = ringkasan?.potensi.sr ?? stats.potensi_sr ?? stats.derived_sr ?? 0
    const potensiKk = ringkasan?.potensi.kk ?? stats.potensi_kk ?? stats.derived_kk ?? 0
    const potensiJiwa = ringkasan?.potensi.jiwa ?? stats.potensi_jiwa ?? stats.derived_jiwa ?? 0
    const potensiKontrak = ringkasan?.potensi.nilai_kontrak ?? stats.potensi_nilai_kontrak ?? stats.derived_nilai_kontrak ?? 0
    const capaianKontrak = ringkasan?.capaian.nilai_kontrak ?? stats.capaian_nilai_kontrak ?? stats.manual_nilai_kontrak ?? 0
    const accumulationStart =
        ringkasan?.accumulation_start_tahun ?? stats.accumulation_start_tahun ?? SPAM_ACCUMULATION_START_TAHUN
    const baselineCap = ringkasan?.baseline_cap_tahun ?? stats.baseline_cap_tahun ?? '2025'
    const tahunScope = tahun || undefined
    const compareScopeLabel = tahunScope
        ? `Tahun ${tahunScope}`
        : getIntegrasiScopeLabel()

    const integrasi = ringkasan?.integrasi

    return (
        <div className="space-y-4">
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-xs text-muted-foreground">
                {getBaselinePolicyLabel()}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs">
                    Periode capaian: {scopeLabel}
                </Badge>
                <Badge variant="outline" className="text-xs">
                    Integrasi pekerjaan: {accumulationStart} ke atas
                </Badge>
                {kecamatanId ? (
                    <Badge variant="secondary" className="text-xs">Filter kecamatan aktif</Badge>
                ) : (
                    <Badge variant="secondary" className="text-xs">Seluruh kabupaten</Badge>
                )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Card className="flex flex-row items-center space-x-4 p-6 shadow-sm">
                    <div className="rounded-lg bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Unit SPAM</p>
                        <h3 className="text-xl font-bold">{stats.total_units}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {unitDenganTautan} unit punya paket tertaut
                        </p>
                    </div>
                </Card>

                <Card className="flex flex-row items-center space-x-4 p-6 shadow-sm">
                    <div className="rounded-lg bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-900/30">
                        <Droplets className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">SR Tercatat</p>
                        <h3 className="text-xl font-bold">{capaianSr.toLocaleString('id-ID')}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Termasuk acuan master · integrasi {capaianIntegrasiSr.toLocaleString('id-ID')} / potensi {potensiSr.toLocaleString('id-ID')} SR
                        </p>
                    </div>
                </Card>

                <Card className="flex flex-row items-center space-x-4 p-6 shadow-sm">
                    <div className="rounded-lg bg-cyan-100 p-3 text-cyan-600 dark:bg-cyan-900/30">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">KK / Jiwa Tercatat</p>
                        <h3 className="text-xl font-bold">
                            {capaianKk.toLocaleString('id-ID')} KK
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {capaianJiwa.toLocaleString('id-ID')} jiwa · potensi {potensiKk.toLocaleString('id-ID')} KK
                        </p>
                    </div>
                </Card>

                <Card className="flex flex-row items-center space-x-4 p-6 shadow-sm">
                    <div className="rounded-lg bg-violet-100 p-3 text-violet-600 dark:bg-violet-900/30">
                        <Package className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Paket Tertaut</p>
                        <h3 className="text-xl font-bold">
                            {paketTertaut}
                            <span className="text-base font-normal text-muted-foreground">
                                {' '}/ {paketTersedia}
                            </span>
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {paketBelumTertaut} paket AM belum ditaut ke unit
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
                            <span className="text-xl font-bold">{coverage}%</span>
                            <span className="text-[10px] text-muted-foreground">
                                target {targetKk.toLocaleString('id-ID')} KK
                            </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                                className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                                style={{ width: `${Math.min(coverage, 100)}%` }}
                            />
                        </div>
                        {spm && (
                            <p className="mt-2 text-[10px] text-muted-foreground">
                                JP {spm.jp_kk.toLocaleString('id-ID')} + BJP {spm.total_bjp_kk.toLocaleString('id-ID')} KK
                            </p>
                        )}
                    </div>
                </Card>
            </div>

            {variant === 'kpi-only' ? null : (
                <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="p-6 shadow-sm">
                        <div className="mb-1 flex items-center gap-2">
                            <Link2 className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold">Integrasi Paket Pekerjaan</h3>
                        </div>
                        <p className="mb-4 text-xs text-muted-foreground">
                            Hanya paket AM tahun {accumulationStart} ke atas. Desa terintegrasi = minimal satu paket sudah ditaut ke unit SPAM.
                        </p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
                                <p className="text-2xl font-bold text-emerald-600">
                                    {integrasi?.desa_terintegrasi ?? stats.matched_count ?? 0}
                                </p>
                                <p className="text-xs text-muted-foreground">Desa terintegrasi</p>
                            </div>
                            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-center">
                                <p className="text-2xl font-bold text-amber-600">
                                    {integrasi?.desa_partial ?? stats.partial_count ?? 0}
                                </p>
                                <p className="text-xs text-muted-foreground">Belum ada tautan</p>
                            </div>
                            <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3 text-center">
                                <p className="text-2xl font-bold text-orange-600">
                                    {integrasi?.desa_tanpa_unit ?? stats.no_unit_count ?? 0}
                                </p>
                                <p className="text-xs text-muted-foreground">Tanpa unit</p>
                            </div>
                            <div className="rounded-lg border border-slate-500/20 bg-slate-500/5 p-3 text-center">
                                <p className="text-2xl font-bold text-slate-600">
                                    {integrasi?.desa_tanpa_pekerjaan ?? stats.no_pekerjaan_count ?? 0}
                                </p>
                                <p className="text-xs text-muted-foreground">Tanpa paket AM</p>
                            </div>
                        </div>
                        <div className="mt-4 grid gap-2 rounded-lg border bg-slate-50/50 p-3 text-xs dark:bg-slate-900/50">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Paket pekerjaan tertaut</span>
                                <span className="font-semibold">{paketTertaut}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Paket AM tersedia di wilayah</span>
                                <span className="font-semibold">{paketTersedia}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Unit dengan minimal 1 tautan</span>
                                <span className="font-semibold">{unitDenganTautan}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="text-muted-foreground">Akumulasi SR dari paket tertaut</span>
                                <span className="font-semibold text-emerald-600">
                                    {(ringkasan?.dari_tautan.sr ?? stats.linked_sr ?? 0).toLocaleString('id-ID')} SR
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 shadow-sm">
                        <div className="mb-1 flex items-center gap-2">
                            <GitCompare className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold">Capaian Unit vs Potensi Pekerjaan</h3>
                        </div>
                        <p className="mb-4 text-xs text-muted-foreground">
                            Perbandingan {compareScopeLabel}. Capaian integrasi hanya tahun {accumulationStart}+;
                            acuan master s/d {baselineCap} tidak ikut dibandingkan.
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <MetricRow label="Sambungan Rumah" capaian={capaianIntegrasiSr} potensi={potensiSr} suffix=" SR" />
                            <MetricRow label="Kepala Keluarga" capaian={capaianIntegrasiKk} potensi={potensiKk} suffix=" KK" />
                            <MetricRow label="Jiwa Terlayani" capaian={capaianIntegrasiJiwa} potensi={potensiJiwa} suffix=" jiwa" />
                            <div className="rounded-lg border bg-slate-50/50 p-3 dark:bg-slate-900/50">
                                <p className="text-xs font-medium text-muted-foreground">Nilai Kontrak / Anggaran</p>
                                <div className="mt-2 grid grid-cols-1 gap-2">
                                    <div>
                                        <p className="text-[10px] uppercase text-muted-foreground">Capaian integrasi di unit</p>
                                        <p className="text-sm font-bold">{formatCurrency(capaianIntegrasiKontrak)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-muted-foreground">Potensi pekerjaan</p>
                                        <p className="text-sm font-bold text-emerald-600">{formatCurrency(potensiKontrak)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}