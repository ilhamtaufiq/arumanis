import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
    Activity,
    Briefcase,
    Camera,
    ChevronDown,
    ChevronRight,
    ClipboardCheck,
    Droplets,
    FileDown,
    FileText,
    Gauge,
    Recycle,
    RefreshCw,
    Shield,
    Users,
    Wallet,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { DataQualityStats } from '@/features/dashboard/components/DataQualityStats'
import { DashboardBarChart, DashboardPieChart } from '@/features/dashboard/components/DashboardCharts'
import { DashboardLineChart } from '@/features/dashboard/components/DashboardLineChart'
import { DashboardSection } from '@/features/dashboard/components/DashboardSection'
import { DashboardStatCard } from '@/features/dashboard/components/DashboardStatCard'
import { formatCurrency, formatNumber } from '@/features/dashboard/lib/format'
import { SpamUnitDashboard } from '@/features/spam-unit/components/SpamUnitDashboard'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { fetchExecutiveDashboardData } from '../api/executive-dashboard'
import {
    buildTopRisks,
    buildTrafficKpis,
    exportExecutiveBriefPdf,
    type TrafficTone,
} from '../lib/executive-brief'

function toneStyles(tone: TrafficTone) {
    switch (tone) {
        case 'green':
            return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
        case 'yellow':
            return 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300'
        case 'red':
            return 'border-destructive/30 bg-destructive/10 text-destructive'
        default:
            return 'border-border bg-muted/40 text-muted-foreground'
    }
}

function toneDot(tone: TrafficTone) {
    switch (tone) {
        case 'green':
            return 'bg-emerald-500'
        case 'yellow':
            return 'bg-amber-500'
        case 'red':
            return 'bg-destructive'
        default:
            return 'bg-muted-foreground'
    }
}

function ExecutiveHero({
    tahunAnggaran,
    generatedAt,
    isLoading,
    dataUpdatedAt,
    isFetching,
    onRefresh,
    onExportBrief,
    exporting,
}: {
    tahunAnggaran: string
    generatedAt?: string
    isLoading: boolean
    dataUpdatedAt?: number
    isFetching: boolean
    onRefresh: () => void
    onExportBrief: () => void
    exporting: boolean
}) {
    const refreshed =
        dataUpdatedAt != null
            ? (() => {
                  const mins = Math.floor((Date.now() - dataUpdatedAt) / 60_000)
                  if (mins <= 0) return 'Baru saja'
                  return `${mins} mnt lalu`
              })()
            : null

    return (
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/15">
                            Dashboard Eksekutif
                        </Badge>
                        <Badge variant="outline" className="border-white/20 text-white/80">
                            TA {tahunAnggaran}
                        </Badge>
                        {refreshed ? (
                            <Badge variant="outline" className="border-white/20 font-normal text-white/60">
                                Cache {refreshed}
                            </Badge>
                        ) : null}
                    </div>
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-64 bg-white/10" />
                            <Skeleton className="h-4 w-96 max-w-full bg-white/10" />
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                Briefing 60 detik
                            </h1>
                            <p className="max-w-2xl text-sm text-white/70 sm:text-base">
                                Pulse status → risiko → capaian SPM → kapasitas lapangan. Detail analisis di bagian bawah.
                            </p>
                            {generatedAt ? (
                                <p className="text-xs text-white/50">
                                    Data SPAM diperbarui: {new Date(generatedAt).toLocaleString('id-ID')}
                                </p>
                            ) : null}
                        </>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="gap-1.5 bg-white/10 text-white hover:bg-white/20"
                        disabled={isFetching}
                        onClick={onRefresh}
                    >
                        <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
                        Refresh
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        className="gap-1.5"
                        disabled={isLoading || exporting}
                        onClick={onExportBrief}
                    >
                        <FileDown className="h-3.5 w-3.5" />
                        {exporting ? 'Menyiapkan…' : 'Export Brief PDF'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export function ExecutiveDashboard() {
    const { tahunAnggaran } = useAppSettingsValues()
    const [detailOpen, setDetailOpen] = useState(false)
    const [exporting, setExporting] = useState(false)

    const { data, isLoading, error, isFetching, dataUpdatedAt, refetch } = useQuery({
        queryKey: ['executive-dashboard', tahunAnggaran],
        queryFn: () => fetchExecutiveDashboardData(tahunAnggaran),
        staleTime: 60_000,
    })

    const dash = data?.dashboard
    const sanitasi = data?.sanitasi
    const pengawas = data?.pengawas
    const analytics = data?.analytics
    const loading = isLoading || isFetching

    const kpis = useMemo(() => (data ? buildTrafficKpis(data) : []), [data])
    const risks = useMemo(() => (data ? buildTopRisks(data) : []), [data])

    const topKecamatan = (dash?.pekerjaanPerKecamatan ?? [])
        .filter((k) => k.name !== 'Cianjurkab' && k.name !== 'NULLs')
        .slice(0, 8)

    const handleExportBrief = () => {
        if (!data) return
        setExporting(true)
        try {
            exportExecutiveBriefPdf(tahunAnggaran, data, kpis, risks)
            toast.success('Executive brief PDF diunduh')
        } catch {
            toast.error('Gagal membuat executive brief')
        } finally {
            setExporting(false)
        }
    }

    return (
        <>
            <Header fixed>
                <div className="flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">Dashboard Eksekutif</span>
                </div>
            </Header>

            <Main>
                <div className="space-y-8 animate-in fade-in duration-500">
                    <ExecutiveHero
                        tahunAnggaran={tahunAnggaran}
                        generatedAt={data?.spam.stats_generated_at}
                        isLoading={isLoading}
                        dataUpdatedAt={dataUpdatedAt}
                        isFetching={isFetching}
                        onRefresh={() => void refetch()}
                        onExportBrief={handleExportBrief}
                        exporting={exporting}
                    />

                    {error ? (
                        <Card className="border-destructive">
                            <CardContent className="pt-6">
                                <p className="text-sm text-destructive">
                                    Gagal memuat dashboard eksekutif. Silakan muat ulang halaman.
                                </p>
                            </CardContent>
                        </Card>
                    ) : null}

                    {/* 1. Pulse */}
                    <DashboardSection
                        title="1 · Pulse"
                        description="Traffic light status — hijau/kuning/merah untuk keputusan cepat."
                    >
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {loading && !data
                                ? Array.from({ length: 4 }).map((_, i) => (
                                      <Skeleton key={i} className="h-28 w-full rounded-xl" />
                                  ))
                                : kpis.map((kpi) => (
                                      <div
                                          key={kpi.label}
                                          className={cn(
                                              'rounded-xl border p-4 shadow-sm',
                                              toneStyles(kpi.tone),
                                          )}
                                      >
                                          <div className="mb-2 flex items-center justify-between gap-2">
                                              <p className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
                                                  {kpi.label}
                                              </p>
                                              <span
                                                  className={cn(
                                                      'h-2.5 w-2.5 rounded-full',
                                                      toneDot(kpi.tone),
                                                  )}
                                              />
                                          </div>
                                          <p className="text-2xl font-bold tabular-nums tracking-tight">
                                              {kpi.value}
                                          </p>
                                          <p className="mt-1 text-xs opacity-80">{kpi.detail}</p>
                                      </div>
                                  ))}
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                            <DashboardStatCard
                                title="Pekerjaan"
                                value={formatNumber(dash?.totalPekerjaan ?? 0)}
                                icon={Briefcase}
                                description={`${formatNumber(dash?.totalKontrak ?? 0)} kontrak`}
                                isLoading={loading}
                                variant="success"
                                compact
                            />
                            <DashboardStatCard
                                title="Pagu Pekerjaan"
                                value={formatCurrency(dash?.totalPaguPekerjaan ?? 0)}
                                icon={Wallet}
                                description={`Kegiatan ${formatCurrency(dash?.totalPagu ?? 0)}`}
                                isLoading={loading}
                                variant="info"
                                compact
                            />
                            <DashboardStatCard
                                title="Nilai Kontrak"
                                value={formatCurrency(dash?.totalNilaiKontrak ?? 0)}
                                icon={FileText}
                                isLoading={loading}
                                variant="warning"
                                compact
                            />
                            <DashboardStatCard
                                title="Penerima Manfaat"
                                value={formatNumber(dash?.totalPenerima ?? 0)}
                                icon={Users}
                                description={`${formatNumber(dash?.totalJiwa ?? 0)} jiwa`}
                                isLoading={loading}
                                variant="default"
                                compact
                            />
                            <DashboardStatCard
                                title="Foto Dokumentasi"
                                value={formatNumber(data?.spam.total_foto_dokumentasi ?? 0)}
                                icon={Camera}
                                description="Terindeks di sistem"
                                isLoading={loading}
                                variant="primary"
                                compact
                            />
                            <DashboardStatCard
                                title="Kegiatan"
                                value={formatNumber(dash?.totalKegiatan ?? 0)}
                                icon={Activity}
                                description={`${formatNumber(dash?.totalOutput ?? 0)} output`}
                                isLoading={loading}
                                variant="info"
                                compact
                            />
                        </div>
                    </DashboardSection>

                    {/* 2. Risks */}
                    <DashboardSection
                        title="2 · Risks"
                        description="Isu yang perlu ditindaklanjuti pimpinan / koordinator."
                    >
                        <div className="mb-4 grid gap-2 sm:grid-cols-2">
                            {loading && !data ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                                ))
                            ) : risks.length === 0 ? (
                                <Card className="border-emerald-500/20 bg-emerald-500/5 sm:col-span-2">
                                    <CardContent className="py-4 text-sm text-emerald-800 dark:text-emerald-300">
                                        Tidak ada risiko prioritas terdeteksi dari kualitas data & analitik.
                                    </CardContent>
                                </Card>
                            ) : (
                                risks.map((risk) => (
                                    <a
                                        key={risk.title}
                                        href={risk.href}
                                        className={cn(
                                            'flex items-start justify-between gap-3 rounded-xl border px-4 py-3 transition-colors hover:border-primary/40',
                                            risk.severity === 'high' &&
                                                'border-destructive/25 bg-destructive/5',
                                            risk.severity === 'medium' &&
                                                'border-amber-500/25 bg-amber-500/5',
                                            risk.severity === 'low' && 'border-border bg-card',
                                        )}
                                    >
                                        <div className="min-w-0">
                                            <div className="mb-1 flex items-center gap-2">
                                                <Badge
                                                    variant={
                                                        risk.severity === 'high'
                                                            ? 'destructive'
                                                            : 'secondary'
                                                    }
                                                    className="text-[10px] uppercase"
                                                >
                                                    {risk.severity}
                                                </Badge>
                                            </div>
                                            <p className="text-sm font-semibold">{risk.title}</p>
                                            <p className="text-xs text-muted-foreground">{risk.detail}</p>
                                        </div>
                                        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                                    </a>
                                ))
                            )}
                        </div>
                        <DataQualityStats year={tahunAnggaran} />
                    </DashboardSection>

                    {/* 3. Outcomes */}
                    <DashboardSection
                        title="3 · Outcomes"
                        description="Capaian SPM air minum & sanitasi."
                    >
                        <div className="space-y-4">
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    SPM Air Minum
                                </p>
                                <SpamUnitDashboard tahun={tahunAnggaran} variant="kpi-only" />
                            </div>
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    SPM Sanitasi
                                </p>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <DashboardStatCard
                                        title="Cakupan KK"
                                        value={`${(sanitasi?.coverage_kk_percentage ?? 0).toFixed(1)}%`}
                                        icon={Recycle}
                                        description={`Target ${formatNumber(sanitasi?.target_kk ?? 0)} KK`}
                                        isLoading={loading}
                                        variant="success"
                                        compact
                                    />
                                    <DashboardStatCard
                                        title="Pemanfaat"
                                        value={`${formatNumber(sanitasi?.total_pemanfaat_kk ?? 0)} KK`}
                                        icon={Users}
                                        description={`${formatNumber(sanitasi?.total_pemanfaat_jiwa ?? 0)} jiwa`}
                                        isLoading={loading}
                                        variant="info"
                                        compact
                                    />
                                    <DashboardStatCard
                                        title="Infrastruktur"
                                        value={formatNumber(sanitasi?.total_count ?? 0)}
                                        icon={Droplets}
                                        description={`${formatNumber(sanitasi?.berfungsi_count ?? 0)} berfungsi`}
                                        isLoading={loading}
                                        variant="primary"
                                        compact
                                    />
                                    <DashboardStatCard
                                        title="Investasi"
                                        value={formatCurrency(sanitasi?.total_investasi ?? 0)}
                                        icon={Wallet}
                                        description={`${formatNumber(sanitasi?.desa_with_infrastruktur ?? 0)} desa terlayani`}
                                        isLoading={loading}
                                        variant="warning"
                                        compact
                                    />
                                </div>
                            </div>
                        </div>
                    </DashboardSection>

                    {/* 4. Capacity */}
                    <DashboardSection
                        title="4 · Capacity"
                        description="Kapasitas pengawasan lapangan."
                    >
                        <div className="grid gap-4 sm:grid-cols-3">
                            <DashboardStatCard
                                title="Pengawas Aktif"
                                value={formatNumber(pengawas?.total_pengawas ?? 0)}
                                icon={Shield}
                                isLoading={loading}
                                variant="info"
                            />
                            <DashboardStatCard
                                title="Lokasi Dipantau"
                                value={formatNumber(pengawas?.total_lokasi ?? 0)}
                                icon={ClipboardCheck}
                                isLoading={loading}
                                variant="success"
                            />
                            <DashboardStatCard
                                title="Total Pagu Dipantau"
                                value={formatCurrency(pengawas?.total_pagu ?? 0)}
                                icon={Wallet}
                                isLoading={loading}
                                variant="warning"
                            />
                        </div>
                    </DashboardSection>

                    {/* Detail analytics (collapsible) */}
                    <Collapsible open={detailOpen} onOpenChange={setDetailOpen}>
                        <div className="rounded-2xl border bg-card">
                            <CollapsibleTrigger asChild>
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-muted/40"
                                >
                                    <div>
                                        <p className="font-semibold">Detail analisis</p>
                                        <p className="text-sm text-muted-foreground">
                                            Tren progres, sebaran wilayah, dan komposisi kategori
                                        </p>
                                    </div>
                                    {detailOpen ? (
                                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="border-t p-5">
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        <DashboardLineChart
                                            title="Tren Progres Fisik"
                                            description="Rencana vs realisasi per minggu"
                                            data={analytics?.trend ?? []}
                                            isLoading={loading}
                                        />
                                        <DashboardBarChart
                                            title="Pekerjaan per Kecamatan"
                                            description="Top kecamatan tahun anggaran aktif"
                                            data={topKecamatan}
                                            isLoading={loading}
                                            layout="vertical"
                                            height={350}
                                        />
                                        <DashboardBarChart
                                            title="Performa per Wilayah"
                                            description="Indeks performa dari analitik dashboard"
                                            data={analytics?.regions ?? []}
                                            isLoading={loading}
                                            layout="horizontal"
                                        />
                                        <DashboardPieChart
                                            title="Komposisi Kategori"
                                            description="Distribusi kategori pekerjaan"
                                            data={analytics?.categories ?? []}
                                            isLoading={loading}
                                        />
                                    </div>
                                    <div className="mt-4">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link to="/dashboard" search={{ tab: 'analytics' }}>
                                                Buka Analytics lengkap
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </div>
                    </Collapsible>
                </div>
            </Main>
        </>
    )
}
