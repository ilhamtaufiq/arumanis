import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
    Briefcase,
    ChevronDown,
    ChevronRight,
    ClipboardCheck,
    FileDown,
    RefreshCw,
    ShieldAlert,
    Users,
    Wallet,
} from 'lucide-react'
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    LineChart,
    XAxis,
    YAxis,
} from 'recharts'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { ChartConfig } from '@/components/ui/chart'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { DashboardBarChart, DashboardPieChart } from '@/features/dashboard/components/DashboardCharts'
import { DashboardStatCard } from '@/features/dashboard/components/DashboardStatCard'
import { formatCurrency, formatNumber } from '@/features/dashboard/lib/format'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { fetchExecutiveDashboardData } from '../api/executive-dashboard'
import { buildTopRisks, getPekerjaanStatusRecap } from '../lib/executive-brief'
import { ExecCoverageCard, ExecProgressGauges } from './ExecCharts'

const progressChartConfig: ChartConfig = {
    fisik: { label: 'Fisik', color: 'var(--chart-1)' },
    keuangan: { label: 'Realisasi Keuangan', color: 'var(--chart-2)' },
}

export function ExecutiveDashboard() {
    const { tahunAnggaran } = useAppSettingsValues()
    const [detailOpen, setDetailOpen] = useState(false)
    const [exporting, setExporting] = useState(false)
    const [excludeKonsultan, setExcludeKonsultan] = useState(false)

    const { data, isLoading, error, isFetching, refetch } = useQuery({
        queryKey: ['executive-dashboard', tahunAnggaran],
        queryFn: () => fetchExecutiveDashboardData(tahunAnggaran),
        staleTime: 60_000,
    })

    const dash = data?.dashboard
    const loading = isLoading || isFetching
    const recapOptions = useMemo(() => ({ excludeKonsultan }), [excludeKonsultan])

    const risks = useMemo(
        () => (data ? buildTopRisks(data, recapOptions).slice(0, 5) : []),
        [data, recapOptions],
    )
    const paketRecap = useMemo(
        () => (data ? getPekerjaanStatusRecap(data, recapOptions) : null),
        [data, recapOptions],
    )

    const totalRealisasi = data?.progress?.totals.keuangan_total ?? 0

    const kontrakPct = paketRecap && paketRecap.aktif > 0
        ? (paketRecap.berkontrak / paketRecap.aktif) * 100
        : null
    const kontrakCaption = paketRecap
        ? `${formatNumber(paketRecap.berkontrak)} / ${formatNumber(paketRecap.aktif)} paket`
        : undefined

    const penerimaRows = useMemo(() => {
        if (!data) return []
        const d = data.dashboard
        return [
            { label: 'Total Penerima', value: formatNumber(d.totalPenerima ?? 0) },
            { label: 'Jiwa Tertuju', value: formatNumber(d.totalJiwa ?? 0) },
            { label: 'Unit SPAM', value: formatNumber(data.spam?.total_units ?? 0) },
            { label: 'Total KK Sasaran', value: formatNumber(data.spam?.total_kk ?? 0) },
        ]
    }, [data])

    const topKecamatan = (dash?.pekerjaanPerKecamatan ?? [])
        .filter((k) => k.name !== 'Cianjurkab' && k.name !== 'NULLs')
        .slice(0, 6)

    const handleExportBrief = () => {
        if (!data) return
        setExporting(true)
        try {
            // PDF export needs existing KPI builder — keep using it
            import('../lib/executive-brief').then(({ exportExecutiveBriefPdf, buildTrafficKpis }) => {
                const kpis = buildTrafficKpis(data, recapOptions)
                exportExecutiveBriefPdf(tahunAnggaran, data, kpis, risks, recapOptions)
                toast.success('Executive brief PDF diunduh')
            })
        } catch {
            toast.error('Gagal membuat executive brief')
        } finally {
            setExporting(false)
        }
    }

    return (
        <>
            <Header fixed />

            <Main fluid className="w-full max-w-none px-3 pb-8 pt-4 sm:px-5">
                <div className="w-full min-w-0 space-y-5 animate-in fade-in duration-500">
                    {/* Compact header */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold tracking-tight">Dashboard Eksekutif</h1>
                            <Badge variant="secondary">TA {tahunAnggaran}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <input
                                    type="checkbox"
                                    checked={excludeKonsultan}
                                    onChange={(e) => setExcludeKonsultan(e.target.checked)}
                                    disabled={loading && !data}
                                    className="h-3.5 w-3.5 rounded"
                                />
                                Exclude konsultan
                            </label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1"
                                disabled={isFetching}
                                onClick={() => void refetch()}
                            >
                                <RefreshCw className={cn('h-3 w-3', isFetching && 'animate-spin')} />
                                Refresh
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1"
                                disabled={isLoading || exporting}
                                onClick={handleExportBrief}
                            >
                                <FileDown className="h-3 w-3" />
                                {exporting ? '…' : 'PDF'}
                            </Button>
                        </div>
                    </div>

                    {error ? (
                        <Card className="border-destructive">
                            <CardContent className="pt-6">
                                <p className="text-sm text-destructive">
                                    Gagal memuat dashboard. Silakan muat ulang halaman.
                                </p>
                            </CardContent>
                        </Card>
                    ) : null}

                    {/* Stat cards */}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <DashboardStatCard
                            title="Paket Aktif"
                            value={formatNumber(paketRecap?.aktif ?? dash?.totalPekerjaan ?? 0)}
                            icon={Briefcase}
                            description={excludeKonsultan ? 'Fisik' : 'Non-batal'}
                            isLoading={loading}
                            variant="success"
                            compact
                        />
                        <DashboardStatCard
                            title={excludeKonsultan ? 'Pagu Fisik' : 'Pagu Aktif'}
                            value={formatCurrency(paketRecap?.paguAktif ?? dash?.totalPaguPekerjaan ?? 0)}
                            icon={Wallet}
                            isLoading={loading}
                            variant="info"
                            compact
                        />
                        <DashboardStatCard
                            title="Nilai Kontrak"
                            value={formatCurrency(dash?.totalNilaiKontrak ?? 0)}
                            icon={ClipboardCheck}
                            description={`${formatNumber(dash?.totalKontrak ?? 0)} kontrak`}
                            isLoading={loading}
                            variant="warning"
                            compact
                        />
                        <DashboardStatCard
                            title="Realisasi SP2D"
                            value={totalRealisasi > 0 ? formatCurrency(totalRealisasi) : '—'}
                            icon={Wallet}
                            description={
                                totalRealisasi > 0 && (dash?.totalNilaiKontrak ?? 0) > 0
                                    ? `${((totalRealisasi / (dash?.totalNilaiKontrak ?? 1)) * 100).toFixed(1)}% dari kontrak`
                                    : 'Belum ada data'
                            }
                            isLoading={loading}
                            variant="success"
                            compact
                        />
                    </div>

                    {/* Infografis: gauges + layanan + kontrak */}
                    <div className="grid gap-4 lg:grid-cols-3">
                        <ExecProgressGauges
                            fisik={data?.estimasiProgress?.avgFisik ?? null}
                            keuangan={data?.estimasiProgress?.avgKeuangan ?? null}
                            kontrak={kontrakPct}
                            kontrakCaption={kontrakCaption}
                            isLoading={loading}
                        />
                        <ExecCoverageCard
                            spam={data?.spam?.coverage_percentage ?? null}
                            sanitasi={data?.sanitasi?.coverage_percentage ?? null}
                            rows={penerimaRows}
                            isLoading={loading}
                        />
                        <DashboardPieChart
                            title="Status Kontrak Paket"
                            description="Paket aktif berdasarkan status kontrak"
                            data={[
                                { name: 'Berkontrak', value: paketRecap?.berkontrak ?? 0 },
                                { name: 'Belum Kontrak', value: paketRecap?.belumBerkontrak ?? 0 },
                                { name: 'Batal', value: paketRecap?.batal ?? 0 },
                            ].filter((d) => d.value > 0)}
                            isLoading={loading}
                        />
                    </div>

                    {/* Dampak: penerima + output */}
                    <div className="grid gap-4 lg:grid-cols-2">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Users className="h-4 w-4 text-primary" />
                                    Dampak Penerima Manfaat
                                </CardTitle>
                                <CardDescription>Total penerima & jiwa tertuju program</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {[
                                    { label: 'Penerima', value: formatNumber(data?.dashboard.totalPenerima ?? 0) },
                                    { label: 'Jiwa', value: formatNumber(data?.dashboard.totalJiwa ?? 0) },
                                    { label: 'Output Fisik', value: formatNumber(data?.dashboard.totalOutput ?? 0) },
                                    { label: 'Desa Terlayani', value: formatNumber(data?.sanitasi?.desa_with_infrastruktur ?? 0) },
                                ].map((item) => (
                                    <div key={item.label} className="rounded-lg border bg-muted/30 p-3 text-center">
                                        <p className="text-lg font-bold tabular-nums">{loading ? '—' : item.value}</p>
                                        <p className="text-xs text-muted-foreground">{item.label}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <DashboardBarChart
                            title="Kontrak per Penyedia"
                            description="Top penyedia berdasarkan jumlah kontrak"
                            data={(dash?.nilaiKontrakPerPenyedia ?? []).slice(0, 6)}
                            isLoading={loading}
                            layout="vertical"
                            height={220}
                        />
                    </div>

                    {/* Risk summary bar */}
                    <div className="rounded-xl border bg-card px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Risiko</span>
                                {risks.length > 0 ? (
                                    <Badge variant="secondary" className="text-[10px]">
                                        {risks.length} isu
                                    </Badge>
                                ) : (
                                    <span className="text-xs text-muted-foreground">Aman</span>
                                )}
                            </div>
                            {risks.length > 0 && (
                                <Link
                                    to={risks[0].href}
                                    className="max-w-md truncate text-xs text-muted-foreground hover:text-foreground"
                                >
                                    {risks[0].title}
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Charts — collapsible */}
                    <Collapsible open={detailOpen} onOpenChange={setDetailOpen}>
                        <div className="rounded-xl border bg-card">
                            <CollapsibleTrigger asChild>
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/40"
                                >
                                    <span className="text-sm font-medium">Tren & Sebaran</span>
                                    {detailOpen ? (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="border-t p-4 space-y-4">
                                    {/* Progress Fisik vs Realisasi Keuangan */}
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">Progress Fisik vs Realisasi Keuangan</CardTitle>
                                            <CardDescription>Tren bulanan Jan–Desember TA {tahunAnggaran}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {loading ? (
                                                <Skeleton className="h-[300px] w-full" />
                                            ) : data?.progress?.monthly_trend && data.progress.monthly_trend.some(t => t.fisik_avg > 0 || t.keuangan_sum > 0) ? (
                                                <ChartContainer config={progressChartConfig} className="w-full" style={{ height: 300 }}>
                                                    <ComposedChart data={data.progress.monthly_trend}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                                                        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickMargin={8} />
                                                        <YAxis yAxisId="fisik" orientation="left" domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickMargin={8} />
                                                        <YAxis yAxisId="keuangan" orientation="right" hide />
                                                        <ChartTooltip content={<ChartTooltipContent />} />
                                                        <Legend verticalAlign="top" height={36} />
                                                        <Line yAxisId="fisik" type="monotone" dataKey="fisik_avg" name="Fisik (%)" stroke="var(--chart-1)" strokeWidth={2} dot={{ fill: 'var(--chart-1)' }} activeDot={{ r: 5 }} />
                                                        <Bar yAxisId="keuangan" dataKey="keuangan_sum" name="Realisasi Keuangan" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                                                    </ComposedChart>
                                                </ChartContainer>
                                            ) : (
                                                <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">Belum ada data</div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <DashboardBarChart
                                        title="Pekerjaan per Kecamatan"
                                        description="Top kecamatan tahun aktif"
                                        data={topKecamatan}
                                        isLoading={loading}
                                        layout="vertical"
                                        height={280}
                                    />

                                    <DashboardBarChart
                                        title="Output per Komponen"
                                        description="Total output fisik per jenis komponen"
                                        data={(dash?.outputPerKomponen ?? []).slice(0, 8)}
                                        isLoading={loading}
                                        layout="vertical"
                                        height={280}
                                    />

                                    {/* Data quality ring */}
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">Kelengkapan Data Pekerjaan</CardTitle>
                                            <CardDescription>Job tanpa koordinat / foto / kontrak</CardDescription>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                            {[
                                                { label: 'Tanpa Koordinat', value: data?.dataQuality?.no_coordinates ?? 0 },
                                                { label: 'Tanpa Foto', value: data?.dataQuality?.no_photos ?? 0 },
                                                { label: 'Tanpa Kontrak', value: data?.dataQuality?.no_contracts ?? 0 },
                                                { label: 'Total Pekerjaan', value: data?.dataQuality?.total_jobs ?? 0 },
                                            ].map((item) => (
                                                <div key={item.label} className="rounded-lg border bg-muted/30 p-3 text-center">
                                                    <p className="text-lg font-bold tabular-nums">{loading ? '—' : formatNumber(item.value)}</p>
                                                    <p className="text-xs text-muted-foreground">{item.label}</p>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </div>
                            </CollapsibleContent>
                        </div>
                    </Collapsible>
                </div>
            </Main>
        </>
    )
}
