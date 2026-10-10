import { useQuery } from '@tanstack/react-query'
import { Medal } from 'lucide-react'
import { BannerNotification } from '@/features/notifications/components/BannerNotification'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Heading } from '@/components/ui/heading'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import ProgressRekap from '@/features/progress/components/ProgressRekap'
import { getProgresMvp, type ProgresPerPengawas } from '../api/dashboard'
import { formatNumber } from '../lib/format'

const pct = (v: number | null | undefined) => (v == null ? '—' : `${Number(v).toFixed(1)}%`)

type RoleKey = ProgresPerPengawas['role']

/** Urutkan peringkat: progres tertinggi di atas, lalu jumlah paket terbanyak. Progres kosong di bawah. */
function rankFor(list: ProgresPerPengawas[], role: RoleKey) {
    return list
        .filter((o) => o.role === role)
        .sort((a, b) => {
            const av = a.rata_progres ?? -1
            const bv = b.rata_progres ?? -1
            return bv - av || b.jumlah_pekerjaan - a.jumlah_pekerjaan
        })
}

/** Halaman progres pekerjaan: peringkat pengawasan di atas, lalu rekap progres paket. */
export function DashboardProgresPage() {
    const { tahunAnggaran } = useAppSettingsValues()
    const { data: mvp, isLoading: mvpLoading } = useQuery({
        queryKey: ['progres-pengawas-rank', tahunAnggaran],
        queryFn: () => getProgresMvp(tahunAnggaran),
        staleTime: 60_000,
    })
    const kpi = mvp?.data
    const rankPengawas = kpi ? rankFor(kpi.per_pengawas, 'pengawas') : []
    const rankKonsultan = kpi ? rankFor(kpi.per_pengawas, 'konsultan_pengawas') : []

    return (
        <>
            <BannerNotification />
            <Header fixed />
            <Main fluid className="w-full max-w-none px-3 pb-8 pt-4 sm:px-5">
                <div className="flex w-full min-w-0 flex-col gap-6">
                    <Heading
                        title="Progres Pekerjaan"
                        description={`TA ${tahunAnggaran} · Peringkat pengawasan dan rekap progres estimasi per paket. Gunakan filter Status untuk menyertakan paket dibatalkan.`}
                    />

                    <section aria-labelledby="peringkat-pengawas" className="flex flex-col gap-3">
                        <h2 id="peringkat-pengawas" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            <Medal className="h-4 w-4" /> Peringkat pengawasan
                        </h2>
                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            <RankingCard title="Pengawas" kpi={kpi?.pengawas.pengawas} ranking={rankPengawas} isLoading={mvpLoading} />
                            <RankingCard
                                title="Konsultan pengawas"
                                kpi={kpi?.pengawas.konsultan_pengawas}
                                ranking={rankKonsultan}
                                isLoading={mvpLoading}
                            />
                        </div>
                    </section>

                    <section aria-labelledby="rekap-paket" className="flex flex-col gap-3">
                        <h2 id="rekap-paket" className="text-sm font-semibold text-muted-foreground">
                            Rekap progres per paket
                        </h2>
                        <ProgressRekap />
                    </section>
                </div>
            </Main>
        </>
    )
}

type PengawasKpiView = {
    aktif: number
    pekerjaan_diawasi: number
    belum_diawasi: number
    rata_progres: number | null
}

function RankingCard({
    title,
    kpi,
    ranking,
    isLoading,
}: {
    title: string
    kpi: PengawasKpiView | undefined
    ranking: ProgresPerPengawas[]
    isLoading: boolean
}) {
    return (
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
            <div className="flex items-baseline justify-between">
                <h3 className="font-semibold">{title}</h3>
                <span className="text-xs text-muted-foreground">{formatNumber(kpi?.aktif ?? 0)} aktif</span>
            </div>
            <dl className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-muted/40 p-2">
                    <dt className="text-[11px] text-muted-foreground">Paket diawasi</dt>
                    <dd className="text-base font-semibold tabular-nums">{formatNumber(kpi?.pekerjaan_diawasi ?? 0)}</dd>
                </div>
                <div className="rounded-lg bg-muted/40 p-2">
                    <dt className="text-[11px] text-muted-foreground">Belum diawasi</dt>
                    <dd className="text-base font-semibold tabular-nums">{formatNumber(kpi?.belum_diawasi ?? 0)}</dd>
                </div>
                <div className="rounded-lg bg-muted/40 p-2">
                    <dt className="text-[11px] text-muted-foreground">Rata progres</dt>
                    <dd className="text-base font-semibold tabular-nums">{pct(kpi?.rata_progres)}</dd>
                </div>
            </dl>
            {isLoading ? (
                <Skeleton className="h-24 w-full" />
            ) : ranking.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">Belum ada penugasan.</p>
            ) : (
                <ol className="flex flex-col divide-y text-sm">
                    {ranking.slice(0, 10).map((o, i) => (
                        <li key={o.user_id} className="flex items-center gap-3 py-2">
                            <span className={`w-6 text-center font-semibold tabular-nums ${i < 3 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                                {i + 1}
                            </span>
                            <span className="min-w-0 flex-1 truncate">{o.nama || '—'}</span>
                            <span className="text-xs text-muted-foreground tabular-nums">{formatNumber(o.jumlah_pekerjaan)} paket</span>
                            <span className="w-16 text-right font-semibold tabular-nums">{pct(o.rata_progres)}</span>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    )
}
