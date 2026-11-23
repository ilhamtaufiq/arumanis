import { useMemo, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { formatNumber } from '@/features/dashboard/lib/format'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'
import { useAppSettingsValues } from '@/hooks/use-app-settings'

type Kelompok = 'semua' | 'tertinggal' | 'sesuai' | 'selesai'

const CHIP: { value: Kelompok; label: string }[] = [
    { value: 'semua', label: 'Semua' },
    { value: 'tertinggal', label: 'Tertinggal' },
    { value: 'sesuai', label: 'Sesuai target' },
    { value: 'selesai', label: 'Selesai 100%' },
]

const persen = (n: number) => `${n.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`

/** Progres pekerjaan: fisik vs rencana, deviasi, dan keuangan. Data dari daftar pekerjaan yang sudah ada. */
export function ProgresScreen() {
    const { tahunAnggaran } = useAppSettingsValues()
    const [kelompok, setKelompok] = useState<Kelompok>('semua')

    const daftar = useInfiniteQuery({
        queryKey: ['mobile-progres', tahunAnggaran],
        queryFn: ({ pageParam }) => getPekerjaan({ page: pageParam, per_page: 50, tahun: tahunAnggaran, status: 'active', summary: true }),
        initialPageParam: 1,
        getNextPageParam: (last) => {
            const m = last.meta
            return m && m.current_page !== undefined && m.last_page !== undefined && m.current_page < m.last_page ? m.current_page + 1 : undefined
        },
        staleTime: 60_000,
    })

    const semua = useMemo(() => {
        const rows = daftar.data?.pages.flatMap((h) => h.data ?? []) ?? []
        return rows
            .map((p) => {
                const fisik = Number(p.progress_estimasi_fisik ?? 0)
                const deviasi = Number(p.deviasi_estimasi_fisik ?? 0)
                return {
                    id: p.id,
                    nama: p.nama_paket,
                    lokasi: [p.desa?.nama_desa, p.kecamatan?.nama_kecamatan].filter(Boolean).join(', '),
                    fisik,
                    rencana: fisik - deviasi,
                    deviasi,
                    keuangan: Number(p.progress_estimasi_keuangan ?? 0),
                }
            })
            .sort((a, b) => a.deviasi - b.deviasi)
    }, [daftar.data])

    const tertinggal = semua.filter((p) => p.deviasi < 0).length
    const sesuai = semua.filter((p) => p.deviasi >= 0 && p.fisik < 100).length
    const selesai = semua.filter((p) => p.fisik >= 100).length
    const rataFisik = semua.length ? semua.reduce((a, p) => a + p.fisik, 0) / semua.length : 0
    const tampil = semua.filter((p) => {
        if (kelompok === 'tertinggal') return p.deviasi < 0
        if (kelompok === 'sesuai') return p.deviasi >= 0 && p.fisik < 100
        if (kelompok === 'selesai') return p.fisik >= 100
        return true
    })

    return (
        <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-6 pt-4">
            <section aria-label="Ringkasan progres" className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1 rounded-xl border bg-background p-3">
                    <span className="text-[11px] text-muted-foreground">Rata-rata fisik</span>
                    <span className="text-lg font-bold tabular-nums">{persen(rataFisik)}</span>
                </div>
                <div className="flex flex-col gap-1 rounded-xl border bg-background p-3">
                    <span className="text-[11px] text-muted-foreground">Tertinggal</span>
                    <span className="text-lg font-bold tabular-nums text-red-600">{formatNumber(tertinggal)}</span>
                </div>
                <div className="flex flex-col gap-1 rounded-xl border bg-background p-3">
                    <span className="text-[11px] text-muted-foreground">Selesai</span>
                    <span className="text-lg font-bold tabular-nums text-emerald-700">{formatNumber(selesai)}</span>
                </div>
            </section>

            <div role="tablist" aria-label="Kelompok progres" className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {CHIP.map((c) => {
                    const n = c.value === 'semua' ? semua.length : c.value === 'tertinggal' ? tertinggal : c.value === 'sesuai' ? sesuai : selesai
                    return (
                        <button key={c.value} type="button" role="tab" aria-selected={kelompok === c.value} onClick={() => setKelompok(c.value)}
                            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${kelompok === c.value ? 'border-primary bg-primary text-primary-foreground' : 'bg-background'}`}>
                            {c.label} <span className="tabular-nums opacity-80">{n}</span>
                        </button>
                    )
                })}
            </div>

            {daftar.isLoading ? (
                <p className="py-10 text-center text-sm text-muted-foreground">Memuat progres…</p>
            ) : daftar.isError ? (
                <div className="flex flex-col items-center gap-2 rounded-xl border p-4 text-center">
                    <p className="text-sm text-red-600">Progres gagal dimuat.</p>
                    <button type="button" onClick={() => void daftar.refetch()} className="rounded-full border px-4 py-1.5 text-sm">Coba lagi</button>
                </div>
            ) : tampil.length === 0 ? (
                <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Tidak ada pekerjaan di kelompok ini.</p>
            ) : (
                <ul className="flex flex-col gap-3">
                    {tampil.map((p) => {
                        const merah = p.deviasi < 0
                        return (
                            <li key={p.id} className="flex flex-col gap-3 rounded-xl border bg-background p-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-muted-foreground">{p.lokasi || 'Lokasi belum diisi'}</span>
                                    <Link to={'/m/proyek/$id' as never} params={{ id: String(p.id) } as never} className="text-sm font-semibold leading-snug">{p.nama}</Link>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium">Fisik {persen(p.fisik)}</span>
                                        <span className="text-muted-foreground">rencana {persen(p.rencana)}</span>
                                    </div>
                                    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
                                        <div className={`h-full rounded-full ${merah ? 'bg-red-600' : 'bg-primary'}`} style={{ width: `${Math.min(100, Math.max(0, p.fisik))}%` }} />
                                        <div className="absolute top-0 h-full w-0.5 bg-foreground/60" style={{ left: `${Math.min(100, Math.max(0, p.rencana))}%` }} />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className={`rounded-full px-2 py-0.5 font-semibold ${merah ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {p.deviasi === 0 ? 'Sesuai target' : `${p.deviasi > 0 ? '+' : ''}${persen(p.deviasi)}`}
                                    </span>
                                    <span className="text-muted-foreground">Keuangan {persen(p.keuangan)}</span>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}

            {daftar.hasNextPage ? (
                <button type="button" onClick={() => void daftar.fetchNextPage()} disabled={daftar.isFetchingNextPage} className="h-11 rounded-full border text-sm font-medium disabled:opacity-60">
                    {daftar.isFetchingNextPage ? 'Memuat…' : 'Muat lebih banyak'}
                </button>
            ) : null}
        </main>
    )
}
