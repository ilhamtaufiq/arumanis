import { useQuery } from '@tanstack/react-query'
import { Briefcase, Gauge, Wallet, AlertCircle, HardHat, UserCheck } from 'lucide-react'
import { BannerNotification } from '@/features/notifications/components/BannerNotification'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Heading } from '@/components/ui/heading'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { getProgresMvp, type PengawasKpi, type ProgresMvp } from '../api/dashboard'
import { formatCurrency, formatNumber } from '../lib/format'
import { DashboardBarChart } from './DashboardCharts'
import { DashboardStatCard } from './DashboardStatCard'

const pct = (v: number | null | undefined) => (v == null ? '—' : `${v.toFixed(1)}%`)

export function DashboardProgresPage() {
    const { tahunAnggaran } = useAppSettingsValues()
    const { data, isLoading, isError } = useQuery({
        queryKey: ['dashboard-progres-mvp', tahunAnggaran],
        queryFn: () => getProgresMvp(tahunAnggaran),
        staleTime: 60_000,
    })
    const stats: ProgresMvp | undefined = data?.data

    return (
        <>
            <BannerNotification />
            <Header fixed />
            <Main fluid className="w-full max-w-none px-3 pb-8 pt-4 sm:px-5">
                <div className="flex w-full min-w-0 flex-col gap-6">
                    <Heading
                        title="Progres Pekerjaan"
                        description={`TA ${tahunAnggaran} · Progres fisik terbaru per pekerjaan`}
                    />

                    {isError ? (
                        <p className="rounded-lg border border-red-500/20 bg-red-500/[0.04] p-4 text-sm text-red-600">
                            Data progres belum bisa dimuat. Coba muat ulang halaman.
                        </p>
                    ) : null}

                    <section aria-labelledby="kpi-progres" className="flex flex-col gap-3">
                        <h2 id="kpi-progres" className="text-sm font-semibold text-muted-foreground">
                            Ringkasan
                        </h2>
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                            <DashboardStatCard
                                title="Total pekerjaan"
                                value={formatNumber(stats?.kpi.total_pekerjaan ?? 0)}
                                icon={Briefcase}
                                isLoading={isLoading}
                                variant="primary"
                            />
                            <DashboardStatCard
                                title="Rata-rata progres fisik"
                                value={pct(stats?.kpi.rata_progres)}
                                description="Hanya pekerjaan yang punya riwayat realisasi"
                                icon={Gauge}
                                isLoading={isLoading}
                                variant="success"
                            />
                            <DashboardStatCard
                                title="Belum ada progres"
                                value={formatNumber(stats?.kpi.belum_progres ?? 0)}
                                description="Belum ada realisasi fisik"
                                icon={AlertCircle}
                                isLoading={isLoading}
                                variant="warning"
                            />
                            <DashboardStatCard
                                title="Total pagu"
                                value={formatCurrency(stats?.kpi.total_pagu ?? 0)}
                                icon={Wallet}
                                isLoading={isLoading}
                                variant="info"
                            />
                        </div>
                    </section>

                    <section aria-labelledby="kpi-pengawas" className="flex flex-col gap-3">
                        <h2 id="kpi-pengawas" className="text-sm font-semibold text-muted-foreground">
                            Pengawasan
                        </h2>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <PengawasCard
                                title="Pengawas"
                                icon={HardHat}
                                kpi={stats?.pengawas.pengawas}
                                isLoading={isLoading}
                            />
                            <PengawasCard
                                title="Konsultan pengawas"
                                icon={UserCheck}
                                kpi={stats?.pengawas.konsultan_pengawas}
                                isLoading={isLoading}
                            />
                        </div>
                    </section>

                    <DashboardBarChart
                        title="Pekerjaan per kecamatan"
                        description="Jumlah pekerjaan dan rata-rata progres fisik"
                        data={(stats?.per_kecamatan ?? []).map((k) => ({
                            name: k.nama,
                            value: k.jumlah,
                            progres: k.rata_progres ?? 0,
                        }))}
                        isLoading={isLoading}
                        dataKey="value"
                        layout="horizontal"
                        height={320}
                    />

                    <section aria-labelledby="daftar-pengawas" className="flex flex-col gap-3">
                        <h2 id="daftar-pengawas" className="text-sm font-semibold text-muted-foreground">
                            Pengawas dan konsultan pengawas
                        </h2>
                        <div className="overflow-x-auto rounded-xl border bg-card">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                                    <tr>
                                        <th scope="col" className="px-3 py-2 font-medium">Nama</th>
                                        <th scope="col" className="px-3 py-2 font-medium">Peran</th>
                                        <th scope="col" className="px-3 py-2 text-right font-medium">Pekerjaan</th>
                                        <th scope="col" className="px-3 py-2 text-right font-medium">Rata-rata progres</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={4} className="p-3">
                                                <Skeleton className="h-6 w-full" />
                                            </td>
                                        </tr>
                                    ) : (stats?.per_pengawas.length ?? 0) === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-3 text-center text-muted-foreground">
                                                Belum ada pengawas yang ditugaskan.
                                            </td>
                                        </tr>
                                    ) : (
                                        stats?.per_pengawas.map((o) => (
                                            <tr key={`${o.user_id}-${o.role}`} className="border-t">
                                                <td className="px-3 py-2">{o.nama || '—'}</td>
                                                <td className="px-3 py-2">
                                                    {o.role === 'pengawas' ? 'Pengawas' : 'Konsultan pengawas'}
                                                </td>
                                                <td className="px-3 py-2 text-right tabular-nums">{formatNumber(o.jumlah_pekerjaan)}</td>
                                                <td className="px-3 py-2 text-right tabular-nums">{pct(o.rata_progres)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </Main>
        </>
    )
}

function PengawasCard({
    title,
    icon,
    kpi,
    isLoading,
}: {
    title: string
    icon: typeof HardHat
    kpi: PengawasKpi | undefined
    isLoading: boolean
}) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <DashboardStatCard
                title={`${title} aktif`}
                value={formatNumber(kpi?.aktif ?? 0)}
                icon={icon}
                isLoading={isLoading}
                compact
            />
            <DashboardStatCard
                title="Pekerjaan diawasi"
                value={formatNumber(kpi?.pekerjaan_diawasi ?? 0)}
                icon={Briefcase}
                isLoading={isLoading}
                compact
            />
            <DashboardStatCard
                title="Belum diawasi"
                value={formatNumber(kpi?.belum_diawasi ?? 0)}
                icon={AlertCircle}
                isLoading={isLoading}
                variant="warning"
                compact
            />
            <DashboardStatCard
                title="Rata-rata progres"
                value={pct(kpi?.rata_progres)}
                icon={Gauge}
                isLoading={isLoading}
                variant="success"
                compact
            />
        </div>
    )
}
