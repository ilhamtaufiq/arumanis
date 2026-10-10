import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { BannerNotification } from '@/features/notifications/components/BannerNotification'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Heading } from '@/components/ui/heading'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'
import type { Pekerjaan } from '@/features/pekerjaan/types'
import { formatCurrency, formatNumber } from '../lib/format'

const PER_PAGE = 20

const pct = (v: number | null | undefined) => (v == null ? '—' : `${Number(v).toFixed(1)}%`)

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
