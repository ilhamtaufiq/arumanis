import { useQuery } from '@tanstack/react-query'
import { Briefcase, ClipboardList, FileText, Wallet, type LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { getDashboardStats } from '../api/dashboard'
import { formatCurrency, formatNumber } from '../lib/format'

type Kartu = { label: string; nilai: string; keterangan: string; icon: LucideIcon }

/**
 * Empat angka utama TA berjalan. Hanya dirender untuk admin dan manager (pemanggil yang memeriksa peran);
 * endpoint statistik juga hanya dipanggil untuk mereka.
 */
export function DashboardRingkasan() {
    const { tahunAnggaran } = useAppSettingsValues()
    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats', tahunAnggaran],
        queryFn: () => getDashboardStats(tahunAnggaran),
        staleTime: 60_000,
    })

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Memuat ringkasan">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
            </div>
        )
    }

    const kartu: Kartu[] = [
        {
            label: 'Kegiatan',
            nilai: formatNumber(stats?.totalKegiatan ?? 0),
            keterangan: `TA ${tahunAnggaran}`,
            icon: ClipboardList,
        },
        {
            label: 'Pekerjaan',
            nilai: formatNumber(stats?.totalPekerjaan ?? 0),
            keterangan: 'Paket aktif',
            icon: Briefcase,
        },
        {
            label: 'Kontrak',
            nilai: formatNumber(stats?.totalKontrak ?? 0),
            keterangan: 'Kontrak aktif',
            icon: FileText,
        },
        {
            label: 'Nilai kontrak',
            nilai: formatCurrency(stats?.totalNilaiKontrak ?? 0),
            keterangan: 'Total nilai kontrak',
            icon: Wallet,
        },
    ]

    return (
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border xl:grid-cols-4">
            {kartu.map((k) => (
                <div key={k.label} className="flex min-w-0 flex-col gap-1 bg-background p-4">
                    <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <k.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        {k.label}
                    </dt>
                    <dd className="truncate text-xl font-semibold tabular-nums">{k.nilai}</dd>
                    <dd className="text-xs text-muted-foreground">{k.keterangan}</dd>
                </div>
            ))}
        </dl>
    )
}
