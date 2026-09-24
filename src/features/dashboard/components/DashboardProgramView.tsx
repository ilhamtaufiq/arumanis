import { Activity, Briefcase, Package, Users } from 'lucide-react'
import { formatNumber } from '../lib/format'
import { DashboardBarChart, DashboardPieChart } from './DashboardCharts'
import { DashboardStatCard } from './DashboardStatCard'
import { useV2Stats } from '../hooks/use-v2-stats'
import { V2PageShell, V2Section } from './DashboardV2Page'

/** Halaman Program — promosi seksi v2 (pekerjaan, output, penerima). */
export function DashboardProgramView() {
    const { stats, isLoading } = useV2Stats()

    return (
        <V2PageShell>
            <div className='flex flex-col gap-6'>
                <V2Section title='Capaian' description='Kegiatan, pekerjaan, output, dan penerima.'>
                    <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
                        <DashboardStatCard
                            title='Total Kegiatan'
                            value={formatNumber(stats?.totalKegiatan ?? 0)}
                            icon={Activity}
                            description='Program/kegiatan terdaftar'
                            isLoading={isLoading}
                            variant='info'
                            compact
                        />
                        <DashboardStatCard
                            title='Total Pekerjaan'
                            value={formatNumber(stats?.totalPekerjaan ?? 0)}
                            icon={Briefcase}
                            description={`${formatNumber(stats?.pekerjaanAktif ?? stats?.totalPekerjaan ?? 0)} aktif`}
                            isLoading={isLoading}
                            variant='success'
                            compact
                        />
                        <DashboardStatCard
                            title='Total Output'
                            value={formatNumber(stats?.totalOutput ?? 0)}
                            icon={Package}
                            description='Output pekerjaan'
                            isLoading={isLoading}
                            variant='primary'
                            compact
                        />
                        <DashboardStatCard
                            title='Penerima Manfaat'
                            value={formatNumber(stats?.totalPenerima ?? 0)}
                            icon={Users}
                            description={`${formatNumber(stats?.totalJiwa ?? 0)} jiwa`}
                            isLoading={isLoading}
                            variant='default'
                            compact
                        />
                    </div>
                </V2Section>

                <V2Section title='Kegiatan' description='Distribusi kegiatan dan sumber dana.'>
                    <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
                        <DashboardBarChart
                            title='Kegiatan per Tahun Anggaran'
                            description='Distribusi kegiatan berdasarkan tahun anggaran'
                            data={stats?.kegiatanPerTahun ?? []}
                            isLoading={isLoading}
                            layout='horizontal'
                        />
                        <DashboardPieChart
                            title='Kegiatan per Sumber Dana'
                            description='Distribusi kegiatan berdasarkan sumber dana'
                            data={stats?.kegiatanPerSumberDana ?? []}
                            isLoading={isLoading}
                        />
                    </div>
                </V2Section>

                <V2Section title='Output & Penerima' description='Komposisi output dan tipe penerima.'>
                    <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
                        <DashboardPieChart
                            title='Output per Komponen'
                            description='Distribusi output berdasarkan komponen'
                            data={stats?.outputPerKomponen ?? []}
                            isLoading={isLoading}
                        />
                        <DashboardPieChart
                            title='Penerima Komunal vs Individu'
                            description='Perbandingan tipe penerima manfaat'
                            data={stats?.penerimaKomunalVsIndividu ?? []}
                            isLoading={isLoading}
                        />
                    </div>
                </V2Section>
            </div>
        </V2PageShell>
    )
}
