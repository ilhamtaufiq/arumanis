import { useQuery } from '@tanstack/react-query'
import { GitCompare, Link2, Package } from 'lucide-react'
import { getSpamUnitStats } from '../api'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getBaselinePolicyLabel, getIntegrasiScopeLabel, SPAM_ACCUMULATION_START_TAHUN } from '../lib/baseline'
import type { UnitSpamStats } from '../types'

interface SpamIntegrationDashboardProps {
    kecamatanId?: number
    tahun?: string
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

export function SpamIntegrationDashboard({ kecamatanId, tahun }: SpamIntegrationDashboardProps) {
    const tahunScope = tahun || undefined
    const { data: statsData, isLoading, isFetching } = useQuery({
        queryKey: ['spam-units-stats', kecamatanId, tahunScope],
        queryFn: () =>
            getSpamUnitStats({
                kecamatan_id: kecamatanId,
                tahun: tahunScope,
            }),
        staleTime: 0,
    })

    const stats = statsData?.data as UnitSpamStats | undefined

    if (isLoading) {
        return (
            <div className="grid gap-4 lg:grid-cols-2">
                <Card className="h-48 animate-pulse bg-muted/40" />
                <Card className="h-48 animate-pulse bg-muted/40" />
            </div>
        )
    }

    if (!stats) return null

    const ringkasan = stats.ringkasan
    const accumulationStart =
        ringkasan?.accumulation_start_tahun ?? stats.accumulation_start_tahun ?? SPAM_ACCUMULATION_START_TAHUN
    const baselineCap = ringkasan?.baseline_cap_tahun ?? stats.baseline_cap_tahun ?? '2025'
    const scopeLabel = ringkasan?.scope_label ?? stats.manual_scope_label ?? getIntegrasiScopeLabel(tahunScope)
    const integrasi = ringkasan?.integrasi
    const compareScopeLabel = tahunScope
        ? `Tahun ${tahunScope}`
        : `Paket AM ${accumulationStart} ke atas`

    const paketTertaut = integrasi?.paket_tertaut ?? stats.linked_pekerjaan_count ?? 0
    const paketTersedia = integrasi?.paket_tersedia ?? stats.pekerjaan_air_minum_count ?? 0
    const paketBelumTertaut = integrasi?.paket_belum_tertaut ?? stats.paket_belum_tertaut ?? 0
    const unitDenganTautan = integrasi?.unit_dengan_tautan ?? stats.linked_units_count ?? 0

    const capaianIntegrasiSr = ringkasan?.capaian_integrasi?.sr ?? stats.capaian_integrasi_sr ?? 0
    const capaianIntegrasiKk = ringkasan?.capaian_integrasi?.kk ?? stats.capaian_integrasi_kk ?? 0
    const capaianIntegrasiJiwa = ringkasan?.capaian_integrasi?.jiwa ?? stats.capaian_integrasi_jiwa ?? 0
    const capaianIntegrasiKontrak =
        ringkasan?.capaian_integrasi?.nilai_kontrak ?? stats.capaian_integrasi_nilai_kontrak ?? 0

    const potensiSr = ringkasan?.potensi.sr ?? stats.potensi_sr ?? stats.derived_sr ?? 0
    const potensiKk = ringkasan?.potensi.kk ?? stats.potensi_kk ?? stats.derived_kk ?? 0
    const potensiJiwa = ringkasan?.potensi.jiwa ?? stats.potensi_jiwa ?? stats.derived_jiwa ?? 0
    const potensiKontrak = ringkasan?.potensi.nilai_kontrak ?? stats.potensi_nilai_kontrak ?? stats.derived_nilai_kontrak ?? 0

    return (
        <div className="space-y-4">
            <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 px-4 py-3 text-xs text-muted-foreground">
                {getBaselinePolicyLabel()}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs">
                    Periode: {scopeLabel}
                </Badge>
                {isFetching && !isLoading ? (
                    <Badge variant="secondary" className="text-xs">
                        Memperbarui data…
                    </Badge>
                ) : null}
                {kecamatanId ? (
                    <Badge variant="secondary" className="text-xs">
                        Filter kecamatan aktif
                    </Badge>
                ) : (
                    <Badge variant="secondary" className="text-xs">
                        Seluruh kabupaten
                    </Badge>
                )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="flex flex-row items-center gap-4 p-5 shadow-sm">
                    <div className="rounded-lg bg-violet-100 p-3 text-violet-600 dark:bg-violet-900/30">
                        <Package className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Paket Tertaut</p>
                        <p className="text-xl font-bold">
                            {paketTertaut}
                            <span className="text-base font-normal text-muted-foreground"> / {paketTersedia}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{paketBelumTertaut} belum ditaut</p>
                    </div>
                </Card>
                <Card className="p-5 text-center shadow-sm">
                    <p className="text-2xl font-bold text-emerald-600">
                        {integrasi?.desa_terintegrasi ?? stats.matched_count ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Desa terintegrasi</p>
                </Card>
                <Card className="p-5 text-center shadow-sm">
                    <p className="text-2xl font-bold text-amber-600">
                        {integrasi?.desa_partial ?? stats.partial_count ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Belum ada tautan</p>
                </Card>
                <Card className="p-5 text-center shadow-sm">
                    <p className="text-2xl font-bold text-orange-600">
                        {integrasi?.desa_tanpa_unit ?? stats.no_unit_count ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Tanpa unit SPAM</p>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card className="p-6 shadow-sm">
                    <div className="mb-1 flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold">Ringkasan Tautan</h3>
                    </div>
                    <p className="mb-4 text-xs text-muted-foreground">
                        Desa terintegrasi = minimal satu paket AM sudah ditaut ke unit SPAM.
                    </p>
                    <div className="grid gap-2 rounded-lg border bg-slate-50/50 p-3 text-xs dark:bg-slate-900/50">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Unit dengan minimal 1 tautan</span>
                            <span className="font-semibold">{unitDenganTautan}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Desa tanpa paket AM</span>
                            <span className="font-semibold">
                                {integrasi?.desa_tanpa_pekerjaan ?? stats.no_pekerjaan_count ?? 0}
                            </span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                            <span className="text-muted-foreground">Akumulasi SR dari paket tertaut</span>
                            <span className="font-semibold text-emerald-600">
                                {(ringkasan?.dari_tautan.sr ?? stats.linked_sr ?? 0).toLocaleString('id-ID')} SR
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Akumulasi KK dari paket tertaut</span>
                            <span className="font-semibold text-emerald-600">
                                {(ringkasan?.dari_tautan.kk ?? stats.linked_kk ?? 0).toLocaleString('id-ID')} KK
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
                        acuan master s/d {baselineCap} tidak ikut dibandingkan. Periode mengikuti filter Tahun pada
                        tabel Integrasi Wilayah di bawah.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <MetricRow label="Sambungan Rumah" capaian={capaianIntegrasiSr} potensi={potensiSr} suffix=" SR" />
                        <MetricRow label="Kepala Keluarga" capaian={capaianIntegrasiKk} potensi={potensiKk} suffix=" KK" />
                        <MetricRow label="Jiwa Terlayani" capaian={capaianIntegrasiJiwa} potensi={potensiJiwa} suffix=" jiwa" />
                        <div className="rounded-lg border bg-slate-50/50 p-3 dark:bg-slate-900/50">
                            <p className="text-xs font-medium text-muted-foreground">Nilai Kontrak</p>
                            <div className="mt-2 space-y-2">
                                <div>
                                    <p className="text-[10px] uppercase text-muted-foreground">Capaian di unit</p>
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
        </div>
    )
}