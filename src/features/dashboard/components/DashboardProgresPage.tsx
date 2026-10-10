import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Medal, Search } from 'lucide-react'
import { BannerNotification } from '@/features/notifications/components/BannerNotification'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Heading } from '@/components/ui/heading'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'
import { getProgresMvp, type ProgresPerPengawas } from '../api/dashboard'
import type { Pekerjaan } from '@/features/pekerjaan/types'
import { formatCurrency, formatNumber } from '../lib/format'

const PER_PAGE = 20

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

/** Daftar paket pekerjaan beserta progres fisik dan keuangannya. */
export function DashboardProgresPage() {
    const { tahunAnggaran } = useAppSettingsValues()
    const [search, setSearch] = useState('')
    const [query, setQuery] = useState('')
    const [page, setPage] = useState(1)

    const { data, isLoading, isError, isFetching } = useQuery({
        queryKey: ['progres-paket', tahunAnggaran, query, page],
        queryFn: () =>
            getPekerjaan({
                tahun: tahunAnggaran,
                status: 'active',
                search: query || undefined,
                page,
                per_page: PER_PAGE,
                summary: true,
            }),
        staleTime: 60_000,
        placeholderData: (prev) => prev,
    })

    const { data: mvp, isLoading: mvpLoading } = useQuery({
        queryKey: ['progres-pengawas-rank', tahunAnggaran],
        queryFn: () => getProgresMvp(tahunAnggaran),
        staleTime: 60_000,
    })
    const kpi = mvp?.data
    const rankPengawas = kpi ? rankFor(kpi.per_pengawas, 'pengawas') : []
    const rankKonsultan = kpi ? rankFor(kpi.per_pengawas, 'konsultan_pengawas') : []

    const rows: Pekerjaan[] = data?.data ?? []
    const total = data?.meta?.total ?? 0
    const lastPage = data?.meta?.last_page ?? 1

    const onSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        setQuery(search.trim())
    }

    return (
        <>
            <BannerNotification />
            <Header fixed />
            <Main fluid className="w-full max-w-none px-3 pb-8 pt-4 sm:px-5">
                <div className="flex w-full min-w-0 flex-col gap-4">
                    <Heading
                        title="Progres Paket Pekerjaan"
                        description={`TA ${tahunAnggaran} · ${formatNumber(total)} paket aktif`}
                    />

                    <section aria-labelledby="peringkat-pengawas" className="flex flex-col gap-3">
                        <h2 id="peringkat-pengawas" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            <Medal className="h-4 w-4" /> Peringkat pengawasan
                        </h2>
                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            <RankingCard
                                title="Pengawas"
                                kpi={kpi?.pengawas.pengawas}
                                ranking={rankPengawas}
                                isLoading={mvpLoading}
                            />
                            <RankingCard
                                title="Konsultan pengawas"
                                kpi={kpi?.pengawas.konsultan_pengawas}
                                ranking={rankKonsultan}
                                isLoading={mvpLoading}
                            />
                        </div>
                    </section>

                    <form onSubmit={onSearch} className="flex max-w-md gap-2">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama paket"
                                aria-label="Cari nama paket"
                                className="pl-8"
                            />
                        </div>
                        <Button type="submit" variant="outline">Cari</Button>
                    </form>

                    {isError ? (
                        <p className="rounded-lg border border-red-500/20 bg-red-500/[0.04] p-4 text-sm text-red-600">
                            Data paket belum bisa dimuat. Coba muat ulang halaman.
                        </p>
                    ) : null}

                    <div className="overflow-x-auto rounded-xl border bg-card">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                                <tr>
                                    <th scope="col" className="px-3 py-2 font-medium">Paket</th>
                                    <th scope="col" className="px-3 py-2 font-medium">Kecamatan</th>
                                    <th scope="col" className="px-3 py-2 text-right font-medium">Pagu</th>
                                    <th scope="col" className="w-40 px-3 py-2 font-medium">Fisik</th>
                                    <th scope="col" className="w-40 px-3 py-2 font-medium">Keuangan</th>
                                    <th scope="col" className="px-3 py-2 font-medium">Pengawas</th>
                                </tr>
                            </thead>
                            <tbody className={isFetching ? 'opacity-60' : undefined}>
                                {isLoading ? (
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <tr key={i} className="border-t">
                                            <td colSpan={6} className="p-3">
                                                <Skeleton className="h-6 w-full" />
                                            </td>
                                        </tr>
                                    ))
                                ) : rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-6 text-center text-muted-foreground">
                                            {query ? 'Tidak ada paket yang cocok dengan pencarian.' : 'Belum ada paket aktif pada tahun ini.'}
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((p) => (
                                        <tr key={p.id} className="border-t hover:bg-muted/30">
                                            <td className="px-3 py-2">
                                                <a href={`/pekerjaan/${p.id}`} className="font-medium text-primary hover:underline">
                                                    {p.nama_paket}
                                                </a>
                                                {p.kegiatan?.nama_kegiatan ? (
                                                    <span className="block text-xs text-muted-foreground">{p.kegiatan.nama_kegiatan}</span>
                                                ) : null}
                                            </td>
                                            <td className="px-3 py-2">{p.kecamatan?.nama_kecamatan ?? '—'}</td>
                                            <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(Number(p.pagu ?? 0))}</td>
                                            <td className="px-3 py-2">
                                                <ProgressCell value={p.progress_estimasi_fisik} />
                                            </td>
                                            <td className="px-3 py-2">
                                                <ProgressCell value={p.progress_estimasi_keuangan} />
                                            </td>
                                            <td className="px-3 py-2">{p.pengawas?.nama ?? '—'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            Halaman {page} dari {lastPage}
                        </span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Halaman sebelumnya">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)} aria-label="Halaman berikutnya">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Main>
        </>
    )
}

function ProgressCell({ value }: { value: number | null | undefined }) {
    const v = value == null ? null : Math.max(0, Math.min(100, Number(value)))
    return (
        <div className="flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted" role="presentation">
                <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${v ?? 0}%` }}
                />
            </div>
            <span className="w-12 text-right text-xs tabular-nums">{pct(value)}</span>
        </div>
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
                <span className="text-xs text-muted-foreground">
                    {formatNumber(kpi?.aktif ?? 0)} aktif
                </span>
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
