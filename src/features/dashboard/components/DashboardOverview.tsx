import {
    Activity,
    Briefcase,
    FileText,
    Package,
    Users,
    Wallet,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { DataQualityStats } from './DataQualityStats'
import { DashboardBarChart, DashboardPieChart } from './DashboardCharts'
import { DashboardSection } from './DashboardSection'
import { DashboardStatCard } from './DashboardStatCard'
import { formatCurrency, formatNumber } from '../lib/format'
import type { KegiatanStats } from '../types'

type DashboardOverviewProps = {
    year: string
    stats?: KegiatanStats
    isLoading: boolean
    error: Error | null
}

export function DashboardOverview({
    year,
    stats,
    isLoading,
    error,
}: DashboardOverviewProps) {
    return (
        <div className="space-y-5">
            {error ? (
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <p className="text-sm text-destructive">
                            Gagal memuat data dashboard. Silakan coba lagi.
                        </p>
                    </CardContent>
                </Card>
            ) : null}

            <DashboardSection
                title="Kualitas Data"
                description="Indikator pekerjaan yang perlu ditindaklanjuti segera."
                variant="muted"
            >
                <DataQualityStats year={year} />
            </DashboardSection>

            <div className="grid gap-5 lg:grid-cols-2">
                <DashboardSection
                    title="Ringkasan Operasional"
                    description="Entitas utama tahun anggaran aktif."
                >
                    <div className="grid gap-3 sm:grid-cols-2">
                        <DashboardStatCard
                            title="Total Kegiatan"
                            value={formatNumber(stats?.totalKegiatan ?? 0)}
                            icon={Activity}
                            description="Jumlah kegiatan terdaftar"
                            isLoading={isLoading}
                            variant="info"
                            compact
                        />
                        <DashboardStatCard
                            title="Total Pekerjaan"
                            value={formatNumber(stats?.totalPekerjaan ?? 0)}
                            icon={Briefcase}
                            description="Jumlah pekerjaan aktif"
                            isLoading={isLoading}
                            variant="success"
                            compact
                        />
                        <DashboardStatCard
                            title="Total Kontrak"
                            value={formatNumber(stats?.totalKontrak ?? 0)}
                            icon={FileText}
                            description="Kontrak yang terdaftar"
                            isLoading={isLoading}
                            variant="warning"
                            compact
                        />
                        <DashboardStatCard
                            title="Total Output"
                            value={formatNumber(stats?.totalOutput ?? 0)}
                            icon={Package}
                            description="Output pekerjaan"
                            isLoading={isLoading}
                            variant="primary"
                            compact
                        />
                    </div>
                </DashboardSection>

                <DashboardSection
                    title="Anggaran & Penerima"
                    description="Pagu, kontrak, dan cakupan penerima manfaat."
                >
                    <div className="grid gap-3 sm:grid-cols-2">
                        <DashboardStatCard
                            title="Total Pagu Kegiatan"
                            value={formatCurrency(stats?.totalPagu ?? 0)}
                            icon={Wallet}
                            description="Total anggaran kegiatan"
                            isLoading={isLoading}
                            variant="info"
                            compact
                        />
                        <DashboardStatCard
                            title="Total Pagu Pekerjaan"
                            value={formatCurrency(stats?.totalPaguPekerjaan ?? 0)}
                            icon={Wallet}
                            description="Total anggaran pekerjaan"
                            isLoading={isLoading}
                            variant="success"
                            compact
                        />
                        <DashboardStatCard
                            title="Total Nilai Kontrak"
                            value={formatCurrency(stats?.totalNilaiKontrak ?? 0)}
                            icon={Wallet}
                            description="Nilai seluruh kontrak"
                            isLoading={isLoading}
                            variant="warning"
                            compact
                        />
                        <DashboardStatCard
                            title="Total Penerima"
                            value={formatNumber(stats?.totalPenerima ?? 0)}
                            icon={Users}
                            description={`${formatNumber(stats?.totalJiwa ?? 0)} jiwa`}
                            isLoading={isLoading}
                            variant="default"
                            compact
                        />
                    </div>
                </DashboardSection>
            </div>

            <DashboardSection
                title="Kegiatan & Anggaran"
                description="Distribusi kegiatan dan pagu berdasarkan tahun serta sumber dana."
            >
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <DashboardBarChart
                        title="Kegiatan per Tahun Anggaran"
                        description="Distribusi kegiatan berdasarkan tahun anggaran"
                        data={stats?.kegiatanPerTahun ?? []}
                        isLoading={isLoading}
                        layout="horizontal"
                    />
                    <DashboardPieChart
                        title="Kegiatan per Sumber Dana"
                        description="Distribusi kegiatan berdasarkan sumber dana"
                        data={stats?.kegiatanPerSumberDana ?? []}
                        isLoading={isLoading}
                    />
                    <DashboardBarChart
                        title="Pagu per Tahun Anggaran"
                        description="Total pagu dalam jutaan rupiah"
                        data={stats?.paguPerTahun ?? []}
                        isLoading={isLoading}
                        layout="horizontal"
                    />
                    <DashboardBarChart
                        title="Pekerjaan per Kecamatan"
                        description="Distribusi pekerjaan berdasarkan kecamatan"
                        data={stats?.pekerjaanPerKecamatan ?? []}
                        isLoading={isLoading}
                        layout="vertical"
                        height={400}
                    />
                </div>
            </DashboardSection>

            <DashboardSection
                title="Wilayah & Penyedia"
                description="Sebaran pekerjaan, pagu, dan performa kontrak."
            >
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <DashboardBarChart
                        title="Top 10 Pekerjaan per Desa"
                        description="Desa dengan jumlah pekerjaan terbanyak"
                        data={stats?.pekerjaanPerDesa ?? []}
                        isLoading={isLoading}
                        layout="vertical"
                        height={400}
                    />
                    <DashboardBarChart
                        title="Pagu Pekerjaan per Kecamatan"
                        description="Total pagu dalam jutaan rupiah per kecamatan"
                        data={stats?.paguPekerjaanPerKecamatan ?? []}
                        isLoading={isLoading}
                        layout="vertical"
                        height={400}
                    />
                    <DashboardBarChart
                        title="Top 10 Kontrak per Penyedia"
                        description="Penyedia dengan jumlah kontrak terbanyak"
                        data={stats?.kontrakPerPenyedia ?? []}
                        isLoading={isLoading}
                        layout="vertical"
                        height={400}
                    />
                    <DashboardBarChart
                        title="Nilai Kontrak per Penyedia"
                        description="Total nilai kontrak dalam jutaan rupiah"
                        data={stats?.nilaiKontrakPerPenyedia ?? []}
                        isLoading={isLoading}
                        layout="vertical"
                        height={400}
                    />
                </div>
            </DashboardSection>

            <DashboardSection
                title="Output & Penerima"
                description="Komposisi output dan tipe penerima manfaat."
            >
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <DashboardPieChart
                        title="Output per Komponen"
                        description="Distribusi output berdasarkan komponen"
                        data={stats?.outputPerKomponen ?? []}
                        isLoading={isLoading}
                    />
                    <DashboardPieChart
                        title="Penerima Komunal vs Individu"
                        description="Perbandingan tipe penerima manfaat"
                        data={stats?.penerimaKomunalVsIndividu ?? []}
                        isLoading={isLoading}
                    />
                </div>
            </DashboardSection>
        </div>
    )
}