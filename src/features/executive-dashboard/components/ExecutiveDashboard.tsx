import { useQuery } from '@tanstack/react-query'
import {
    Activity,
    Briefcase,
    Camera,
    ClipboardCheck,
    Droplets,
    FileText,
    Gauge,
    Recycle,
    Shield,
    Users,
    Wallet,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DataQualityStats } from '@/features/dashboard/components/DataQualityStats'
import { DashboardBarChart, DashboardPieChart } from '@/features/dashboard/components/DashboardCharts'
import { DashboardLineChart } from '@/features/dashboard/components/DashboardLineChart'
import { DashboardSection } from '@/features/dashboard/components/DashboardSection'
import { DashboardStatCard } from '@/features/dashboard/components/DashboardStatCard'
import { formatCurrency, formatNumber } from '@/features/dashboard/lib/format'
import { SpamUnitDashboard } from '@/features/spam-unit/components/SpamUnitDashboard'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { fetchExecutiveDashboardData } from '../api/executive-dashboard'

function ExecutiveHero({
    tahunAnggaran,
    generatedAt,
    isLoading,
}: {
    tahunAnggaran: string
    generatedAt?: string
    isLoading: boolean
}) {
    return (
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="relative space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/15">
                        Dashboard Eksekutif
                    </Badge>
                    <Badge variant="outline" className="border-white/20 text-white/80">
                        TA {tahunAnggaran}
                    </Badge>
                </div>
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64 bg-white/10" />
                        <Skeleton className="h-4 w-96 max-w-full bg-white/10" />
                    </div>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Ringkasan Strategis Arumanis
                        </h1>
                        <p className="max-w-2xl text-sm text-white/70 sm:text-base">
                            Agregasi capaian pekerjaan, SPM air minum & sanitasi, pengawasan lapangan,
                            dan kualitas data untuk pengambilan keputusan cepat.
                        </p>
                        {generatedAt ? (
                            <p className="text-xs text-white/50">
                                Data SPAM diperbarui: {new Date(generatedAt).toLocaleString('id-ID')}
                            </p>
                        ) : null}
                    </>
                )}
            </div>
        </div>
    )
}

export function ExecutiveDashboard() {
    const { tahunAnggaran } = useAppSettingsValues()

    const { data, isLoading, error, isFetching } = useQuery({
        queryKey: ['executive-dashboard', tahunAnggaran],
        queryFn: () => fetchExecutiveDashboardData(tahunAnggaran),
        staleTime: 60_000,
    })

    const dash = data?.dashboard
    const sanitasi = data?.sanitasi
    const pengawas = data?.pengawas
    const analytics = data?.analytics
    const loading = isLoading || isFetching

    const topKecamatan = (dash?.pekerjaanPerKecamatan ?? [])
        .filter((k) => k.name !== 'Cianjurkab' && k.name !== 'NULLs')
        .slice(0, 8)

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

                    <DashboardSection
                        title="Indikator Utama"
                        description="Ringkasan operasional tahun anggaran aktif."
                    >
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                            <DashboardStatCard
                                title="Pekerjaan"
                                value={formatNumber(dash?.totalPekerjaan ?? 0)}
                                icon={Briefcase}
                                description={`${formatNumber(dash?.totalKontrak ?? 0)} kontrak`}
                                isLoading={loading}
                                variant="success"
                            />
                            <DashboardStatCard
                                title="Pagu Pekerjaan"
                                value={formatCurrency(dash?.totalPaguPekerjaan ?? 0)}
                                icon={Wallet}
                                description={`Kegiatan ${formatCurrency(dash?.totalPagu ?? 0)}`}
                                isLoading={loading}
                                variant="info"
                            />
                            <DashboardStatCard
                                title="Nilai Kontrak"
                                value={formatCurrency(dash?.totalNilaiKontrak ?? 0)}
                                icon={FileText}
                                isLoading={loading}
                                variant="warning"
                            />
                            <DashboardStatCard
                                title="Penerima Manfaat"
                                value={formatNumber(dash?.totalPenerima ?? 0)}
                                icon={Users}
                                description={`${formatNumber(dash?.totalJiwa ?? 0)} jiwa`}
                                isLoading={loading}
                                variant="default"
                            />
                            <DashboardStatCard
                                title="Foto Dokumentasi"
                                value={formatNumber(data?.spam.total_foto_dokumentasi ?? 0)}
                                icon={Camera}
                                description="Terindeks di sistem"
                                isLoading={loading}
                                variant="primary"
                            />
                            <DashboardStatCard
                                title="Kegiatan"
                                value={formatNumber(dash?.totalKegiatan ?? 0)}
                                icon={Activity}
                                description={`${formatNumber(dash?.totalOutput ?? 0)} output`}
                                isLoading={loading}
                                variant="info"
                            />
                        </div>
                    </DashboardSection>

                    <DashboardSection
                        title="Kualitas Data"
                        description="Pekerjaan yang memerlukan perhatian segera."
                    >
                        <DataQualityStats year={tahunAnggaran} />
                    </DashboardSection>

                    <DashboardSection
                        title="SPM Air Minum"
                        description="Capaian unit SPAM dan integrasi paket pekerjaan."
                    >
                        <SpamUnitDashboard tahun={tahunAnggaran} variant="kpi-only" />
                    </DashboardSection>

                    <DashboardSection
                        title="SPM Sanitasi"
                        description="Cakupan infrastruktur sanitasi dan pemanfaat."
                    >
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <DashboardStatCard
                                title="Cakupan KK"
                                value={`${(sanitasi?.coverage_kk_percentage ?? 0).toFixed(1)}%`}
                                icon={Recycle}
                                description={`Target ${formatNumber(sanitasi?.target_kk ?? 0)} KK`}
                                isLoading={loading}
                                variant="success"
                            />
                            <DashboardStatCard
                                title="Pemanfaat"
                                value={`${formatNumber(sanitasi?.total_pemanfaat_kk ?? 0)} KK`}
                                icon={Users}
                                description={`${formatNumber(sanitasi?.total_pemanfaat_jiwa ?? 0)} jiwa`}
                                isLoading={loading}
                                variant="info"
                            />
                            <DashboardStatCard
                                title="Infrastruktur"
                                value={formatNumber(sanitasi?.total_count ?? 0)}
                                icon={Droplets}
                                description={`${formatNumber(sanitasi?.berfungsi_count ?? 0)} berfungsi`}
                                isLoading={loading}
                                variant="primary"
                            />
                            <DashboardStatCard
                                title="Investasi"
                                value={formatCurrency(sanitasi?.total_investasi ?? 0)}
                                icon={Wallet}
                                description={`${formatNumber(sanitasi?.desa_with_infrastruktur ?? 0)} desa terlayani`}
                                isLoading={loading}
                                variant="warning"
                            />
                        </div>
                    </DashboardSection>

                    <DashboardSection
                        title="Pengawasan Lapangan"
                        description="Cakupan pengawas dan nilai pekerjaan yang dipantau."
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

                    <DashboardSection
                        title="Tren & Wilayah"
                        description="Progres fisik mingguan dan sebaran pekerjaan."
                    >
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
                    </DashboardSection>
                </div>
            </Main>
        </>
    )
}