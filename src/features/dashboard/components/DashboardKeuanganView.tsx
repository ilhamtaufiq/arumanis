import { Wallet } from 'lucide-react'
import { formatCurrency, formatNumber } from '../lib/format'
import { DashboardStatCard } from './DashboardStatCard'
import { RekapProgressCompact } from './RekapProgressCompact'
import { SubKegiatanRealisasi } from './SubKegiatanRealisasi'
import { useV2Stats } from '../hooks/use-v2-stats'
import { V2PageShell } from './DashboardV2Page'

/** Halaman Keuangan — promosi seksi v2 (psrfid Keuangan). */
export function DashboardKeuanganView() {
    const { stats, isLoading } = useV2Stats()

    return (
        <V2PageShell>
            <div className='flex flex-col gap-6'>
                <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
                        <DashboardStatCard
                            title='Pagu Kegiatan'
                            value={formatCurrency(stats?.totalPagu ?? 0)}
                            icon={Wallet}
                            description='Total anggaran kegiatan'
                            isLoading={isLoading}
                            variant='info'
                            compact
                        />
                        <DashboardStatCard
                            title='Pagu Fisik'
                            value={formatCurrency(stats?.totalPaguPekerjaanFisik ?? stats?.totalPaguPekerjaan ?? 0)}
                            icon={Wallet}
                            description='Paket fisik (non-konsultan)'
                            isLoading={isLoading}
                            variant='success'
                            compact
                        />
                        <DashboardStatCard
                            title='Pagu Konsultan'
                            value={formatCurrency(stats?.totalPaguPekerjaanKonsultan ?? 0)}
                            icon={Wallet}
                            description='Paket jasa konsultansi'
                            isLoading={isLoading}
                            variant='primary'
                            compact
                        />
                        <DashboardStatCard
                            title='Nilai Kontrak'
                            value={formatCurrency(stats?.totalNilaiKontrak ?? 0)}
                            icon={Wallet}
                            description={`${formatNumber(stats?.totalKontrak ?? 0)} kontrak`}
                            isLoading={isLoading}
                            variant='warning'
                            compact
                        />
                    </div>

                <SubKegiatanRealisasi items={stats?.subKegiatanStats ?? []} isLoading={isLoading} />

                <RekapProgressCompact />
            </div>
        </V2PageShell>
    )
}
