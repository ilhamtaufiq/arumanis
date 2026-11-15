import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { ringkasProgres } from '../lib/progres'

/** Jumlah paket yang diambil dari server untuk dihitung progresnya. Progres estimasi dihitung di backend, tidak bisa diurutkan di sana. */
const BATAS_AMBIL = 50
const TAMPIL = 5

/** Lima paket dengan progres fisik terendah yang belum 100%. */
export function DashboardProgresTerendah() {
    const { tahunAnggaran } = useAppSettingsValues()

    const { data, isLoading } = useQuery({
        queryKey: ['dashboard-mini', 'progress-incomplete', tahunAnggaran],
        queryFn: async () => {
            const res = await getPekerjaan({
                per_page: BATAS_AMBIL,
                tahun: tahunAnggaran,
                status: 'active',
                summary: true,
            })
            const rows = res.data ?? []
            const totalAktif = res.meta?.total ?? rows.length
            return { ...ringkasProgres(rows, TAMPIL), dicek: rows.length, totalAktif }
        },
        staleTime: 60_000,
    })

    const terendah = data?.terendah ?? []
    const jumlahBelum = data?.jumlahBelum ?? 0
    const sebagianDicek = (data?.totalAktif ?? 0) > (data?.dicek ?? 0)

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                        Progres fisik terendah
                    </CardTitle>
                    {!isLoading && data ? (
                        <p className="text-xs text-muted-foreground">
                            {jumlahBelum === 0
                                ? 'Semua paket sudah 100%'
                                : `${terendah.length} dari ${jumlahBelum} paket belum 100%`}
                            {sebagianDicek ? ` · dihitung dari ${data.dicek} paket pertama` : ''}
                        </p>
                    ) : null}
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {isLoading ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">Memuat progres…</p>
                ) : terendah.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">Tidak ada paket yang tertinggal.</p>
                ) : (
                    <ul className="min-w-0 divide-y">
                        {terendah.map((p) => (
                            <li key={p.id} className="min-w-0">
                                <Link
                                    to="/pekerjaan/$id"
                                    params={{ id: String(p.id) }}
                                    className="flex items-center justify-between gap-3 py-2.5 hover:underline"
                                >
                                    <span className="min-w-0 truncate text-sm">{p.nama_paket}</span>
                                    <Badge variant="secondary" className="shrink-0 tabular-nums">
                                        fisik {p.fisik}% · keu {p.keuangan}%
                                    </Badge>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
                <Button variant="link" size="sm" className="h-auto self-start p-0" asChild>
                    <Link to="/dashboard/progres">Buka rekap progres</Link>
                </Button>
            </CardContent>
        </Card>
    )
}
