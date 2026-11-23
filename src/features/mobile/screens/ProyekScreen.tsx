import { useEffect, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/features/dashboard/lib/format'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'
import { useAppSettingsValues } from '@/hooks/use-app-settings'

type Status = 'active' | 'canceled' | 'all'

const STATUS_CHIP: { value: Status; label: string }[] = [
    { value: 'active', label: 'Aktif' },
    { value: 'all', label: 'Semua' },
    { value: 'canceled', label: 'Dibatalkan' },
]

const PER_HALAMAN = 15

function persen(n: number) {
    return `${n.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`
}

function useDebounced<T>(nilai: T, ms: number): T {
    const [tertunda, setTertunda] = useState(nilai)
    useEffect(() => {
        const t = setTimeout(() => setTertunda(nilai), ms)
        return () => clearTimeout(t)
    }, [nilai, ms])
    return tertunda
}

/** Daftar proyek: pencarian, filter status, progres fisik dengan deviasi, dan muat lebih banyak. */
export function ProyekScreen() {
    const { tahunAnggaran } = useAppSettingsValues()
    const [kueri, setKueri] = useState('')
    const kueriTertunda = useDebounced(kueri.trim(), 300)
    const [status, setStatus] = useState<Status>('active')

    const daftar = useInfiniteQuery({
        queryKey: ['mobile-proyek', tahunAnggaran, kueriTertunda, status],
        queryFn: ({ pageParam }) =>
            getPekerjaan({
                page: pageParam,
                per_page: PER_HALAMAN,
                tahun: tahunAnggaran,
                status,
                search: kueriTertunda || undefined,
                summary: true,
            }),
        initialPageParam: 1,
        getNextPageParam: (last) => {
            const m = last.meta
            return m && m.current_page !== undefined && m.last_page !== undefined && m.current_page < m.last_page ? m.current_page + 1 : undefined
        },
        staleTime: 30_000,
    })

    const semua = daftar.data?.pages.flatMap((h) => h.data ?? []) ?? []
    const total = daftar.data?.pages[0]?.meta?.total ?? semua.length

    return (
        <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-6 pt-4">
            <div className="flex items-baseline justify-between">
                <h1 className="text-xl font-bold tracking-tight">Proyek</h1>
                <span className="text-sm text-muted-foreground tabular-nums">{formatNumber(total)} paket</span>
            </div>

            <label className="relative block">
                <span className="sr-only">Cari paket</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                    type="search"
                    value={kueri}
                    onChange={(e) => setKueri(e.target.value)}
                    placeholder="Cari nama paket…"
                    className="h-12 w-full rounded-full border bg-background pl-12 pr-4 text-base outline-none focus:ring-2 focus:ring-ring"
                />
            </label>

            <div role="tablist" aria-label="Filter status" className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {STATUS_CHIP.map((c) => (
                    <button
                        key={c.value}
                        type="button"
                        role="tab"
                        aria-selected={status === c.value}
                        onClick={() => setStatus(c.value)}
                        className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${status === c.value ? 'border-primary bg-primary text-primary-foreground' : 'bg-background'}`}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            {daftar.isLoading ? (
                <p className="py-10 text-center text-sm text-muted-foreground">Memuat paket…</p>
            ) : daftar.isError ? (
                <div className="flex flex-col items-center gap-2 rounded-xl border p-4 text-center">
                    <p className="text-sm text-red-600">Daftar proyek gagal dimuat.</p>
                    <button type="button" onClick={() => void daftar.refetch()} className="rounded-full border px-4 py-1.5 text-sm">Coba lagi</button>
                </div>
            ) : semua.length === 0 ? (
                <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    {kueriTertunda ? `Tidak ada paket yang cocok dengan “${kueriTertunda}”.` : 'Belum ada paket untuk filter ini.'}
                </p>
            ) : (
                <ul className="flex flex-col gap-3">
                    {semua.map((p) => {
                        const fisik = Number(p.progress_estimasi_fisik ?? 0)
                        const deviasi = Number(p.deviasi_estimasi_fisik ?? 0)
                        const tertinggal = deviasi < 0
                        const lokasi = [p.kecamatan?.nama_kecamatan, p.desa?.nama_desa].filter(Boolean).join(' · ')
                        return (
                            <li key={p.id} className="flex flex-col gap-3 rounded-xl border bg-background p-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-muted-foreground">{lokasi || 'Lokasi belum diisi'}</span>
                                    <h2 className="text-base font-semibold leading-snug">{p.nama_paket}</h2>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Penyedia: <span className="text-foreground">{p.usulan_penyedia?.nama ?? '–'}</span></span>
                                    <span className="font-semibold tabular-nums">{formatCurrency(p.pagu ?? 0)}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium">Fisik {persen(fisik)}</span>
                                        <span className={tertinggal ? 'text-red-600' : 'text-emerald-700'}>
                                            {deviasi === 0 ? 'Sesuai target' : `${deviasi > 0 ? '+' : ''}${persen(deviasi)} dari target`}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
                                        <div className={`h-full rounded-full ${tertinggal ? 'bg-red-600' : 'bg-primary'}`} style={{ width: `${Math.min(100, Math.max(0, fisik))}%` }} />
                                    </div>
                                </div>
                                <Link to={'/pekerjaan/$id' as never} params={{ id: String(p.id) } as never} className="flex h-10 items-center justify-center rounded-lg border text-sm font-medium">
                                    Buka detail
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            )}

            {daftar.hasNextPage ? (
                <button
                    type="button"
                    onClick={() => void daftar.fetchNextPage()}
                    disabled={daftar.isFetchingNextPage}
                    className="h-11 rounded-full border text-sm font-medium disabled:opacity-60"
                >
                    {daftar.isFetchingNextPage ? 'Memuat…' : `Muat lebih banyak (${semua.length} dari ${formatNumber(total)})`}
                </button>
            ) : null}
        </main>
    )
}
