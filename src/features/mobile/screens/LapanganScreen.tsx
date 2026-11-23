import { useEffect, useRef, useState } from 'react'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Camera, Loader2, MapPin, Plus, Trash2, X } from 'lucide-react'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'
import { useAppSettingsValues } from '@/hooks/use-app-settings'
import { useAuthStore } from '@/stores/auth-stores'
import { createPostLapangan, deletePostLapangan, getPostLapangan, type PostLapangan } from '../api/lapangan-post'

const CAPTION_MAKS = 500
const PER_HALAMAN = 10

function waktu(iso?: string | null) {
    if (!iso) return ''
    return new Date(iso).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

/** Lapangan: posting cerita dan foto dari lapangan, terpisah dari foto pekerjaan. */
export function LapanganScreen() {
    const { tahunAnggaran } = useAppSettingsValues()
    const userId = useAuthStore((s) => s.auth.user?.id)
    const qc = useQueryClient()
    const [buka, setBuka] = useState(false)

    const feed = useInfiniteQuery({
        queryKey: ['mobile-lapangan-post', tahunAnggaran],
        queryFn: ({ pageParam }) => getPostLapangan({ page: pageParam, per_page: PER_HALAMAN, tahun: tahunAnggaran }),
        initialPageParam: 1,
        getNextPageParam: (last) => {
            const m = last.meta
            return m && m.current_page < m.last_page ? m.current_page + 1 : undefined
        },
        staleTime: 20_000,
    })

    const hapus = useMutation({
        mutationFn: (id: number) => deletePostLapangan(id),
        onSuccess: () => void qc.invalidateQueries({ queryKey: ['mobile-lapangan-post'] }),
    })

    const daftar: PostLapangan[] = feed.data?.pages.flatMap((h) => h.data ?? []) ?? []

    return (
        <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-6 pt-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Lapangan</h1>
                    <p className="text-xs text-muted-foreground">Cerita dan foto terbaru dari lapangan</p>
                </div>
                <button type="button" onClick={() => setBuka(true)} className="flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">
                    <Plus className="h-4 w-4" aria-hidden /> Posting
                </button>
            </div>

            {feed.isLoading ? (
                <p className="py-10 text-center text-sm text-muted-foreground">Memuat kabar lapangan…</p>
            ) : feed.isError ? (
                <div className="flex flex-col items-center gap-2 rounded-xl border p-4 text-center">
                    <p className="text-sm text-red-600">Kabar lapangan gagal dimuat.</p>
                    <button type="button" onClick={() => void feed.refetch()} className="rounded-full border px-4 py-1.5 text-sm">Coba lagi</button>
                </div>
            ) : daftar.length === 0 ? (
                <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Belum ada posting lapangan. Mulai dengan tombol Posting.</p>
            ) : (
                <ul className="flex flex-col gap-4">
                    {daftar.map((p) => (
                        <li key={p.id} className="overflow-hidden rounded-2xl border bg-background">
                            {p.foto_url ? (
                                <img src={p.foto_url} alt={`Foto lapangan ${p.nama_paket ?? ''}`} className="aspect-[4/3] w-full bg-muted object-cover" loading="lazy" />
                            ) : null}
                            <div className="flex flex-col gap-2 p-4">
                                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                    <span className="font-medium text-foreground">{p.user_name ?? 'Seseorang'}</span>
                                    <span>{waktu(p.created_at)}</span>
                                </div>
                                {p.caption ? <p className="text-sm leading-relaxed">{p.caption}</p> : null}
                                <Link to={'/m/proyek/$id' as never} params={{ id: String(p.pekerjaan_id) } as never} className="text-xs font-semibold text-primary">
                                    {p.nama_paket ?? `Pekerjaan #${p.pekerjaan_id}`}
                                </Link>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" aria-hidden />{p.koordinat || 'Lokasi belum ada'}</span>
                                    {userId !== undefined && p.user_id === userId ? (
                                        <button type="button" onClick={() => { if (window.confirm('Hapus posting ini?')) hapus.mutate(p.id) }} className="flex items-center gap-1 text-red-600">
                                            <Trash2 className="h-3.5 w-3.5" aria-hidden /> Hapus
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {feed.hasNextPage ? (
                <button type="button" onClick={() => void feed.fetchNextPage()} disabled={feed.isFetchingNextPage} className="h-11 rounded-full border text-sm font-medium disabled:opacity-60">
                    {feed.isFetchingNextPage ? 'Memuat…' : 'Muat lebih banyak'}
                </button>
            ) : null}

            {buka ? <Posting onTutup={() => setBuka(false)} /> : null}
        </main>
    )
}

function Posting({ onTutup }: { onTutup: () => void }) {
    const qc = useQueryClient()
    const inputFoto = useRef<HTMLInputElement>(null)
    const [berkas, setBerkas] = useState<File | null>(null)
    const [pratinjau, setPratinjau] = useState<string | null>(null)
    const [cari, setCari] = useState('')
    const [kataCari, setKataCari] = useState('')
    const [paketId, setPaketId] = useState<number | null>(null)
    const [paketNama, setPaketNama] = useState('')
    const [caption, setCaption] = useState('')
    const [koordinat, setKoordinat] = useState('')
    const [galat, setGalat] = useState<string | null>(null)
    const [mencariGps, setMencariGps] = useState(false)

    useEffect(() => {
        if (!berkas) { setPratinjau(null); return }
        const url = URL.createObjectURL(berkas)
        setPratinjau(url)
        return () => URL.revokeObjectURL(url)
    }, [berkas])

    useEffect(() => {
        const t = setTimeout(() => setKataCari(cari.trim()), 300)
        return () => clearTimeout(t)
    }, [cari])

    const hasilPaket = useQuery({
        queryKey: ['mobile-posting-paket', kataCari],
        queryFn: () => getPekerjaan({ search: kataCari, per_page: 6, status: 'active' }),
        enabled: kataCari.length >= 3 && paketId === null,
    })

    const ambilGps = () => {
        if (!('geolocation' in navigator)) { setGalat('Perangkat ini tidak mendukung lokasi.'); return }
        setMencariGps(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setKoordinat(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`)
                setMencariGps(false)
            },
            () => {
                setGalat('Lokasi tidak bisa diambil. Izinkan akses lokasi lalu coba lagi.')
                setMencariGps(false)
            },
            { enableHighAccuracy: true, timeout: 15000 },
        )
    }

    const kirim = useMutation({
        mutationFn: async () => {
            if (!berkas || paketId === null) throw new Error('Pilih foto dan paket terlebih dahulu.')
            const fd = new FormData()
            fd.append('file', berkas)
            fd.append('pekerjaan_id', String(paketId))
            if (caption.trim()) fd.append('caption', caption.trim())
            if (koordinat) fd.append('koordinat', koordinat)
            return createPostLapangan(fd)
        },
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['mobile-lapangan-post'] })
            onTutup()
        },
        onError: (e: Error) => setGalat(e.message || 'Posting gagal. Coba lagi.'),
    })

    const siap = !!berkas && paketId !== null && !kirim.isPending

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-background" role="dialog" aria-modal="true" aria-label="Posting lapangan">
            <div className="flex items-center justify-between border-b px-4 py-3" style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}>
                <button type="button" onClick={onTutup} aria-label="Tutup" className="grid h-10 w-10 place-items-center rounded-full"><X className="h-5 w-5" /></button>
                <span className="text-sm font-semibold">Posting lapangan</span>
                <button type="button" disabled={!siap} onClick={() => { setGalat(null); kirim.mutate() }} className="h-9 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-40">
                    {kirim.isPending ? 'Mengirim…' : 'Bagikan'}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-4">
                    <section className="flex flex-col gap-2">
                        <span className="text-sm font-semibold">Foto</span>
                        <button type="button" onClick={() => inputFoto.current?.click()} className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed bg-muted">
                            {pratinjau ? <img src={pratinjau} alt="Pratinjau foto" className="h-full w-full object-cover" /> : (
                                <span className="flex flex-col items-center gap-2 text-sm text-muted-foreground"><Camera className="h-8 w-8" aria-hidden />Ambil atau pilih foto</span>
                            )}
                        </button>
                        <input ref={inputFoto} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => setBerkas(e.target.files?.[0] ?? null)} />
                    </section>

                    <section className="flex flex-col gap-2">
                        <span className="text-sm font-semibold">Pekerjaan</span>
                        {paketId === null ? (
                            <>
                                <input type="search" value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama pekerjaan (min. 3 huruf)" className="h-11 rounded-xl border bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring" />
                                <ul className="divide-y rounded-xl border">
                                    {(hasilPaket.data?.data ?? []).map((p) => (
                                        <li key={p.id}>
                                            <button type="button" onClick={() => { setPaketId(p.id); setPaketNama(p.nama_paket) }} className="flex w-full flex-col items-start px-4 py-3 text-left">
                                                <span className="text-sm font-medium">{p.nama_paket}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <div className="flex items-start justify-between gap-2 rounded-xl border p-3 text-sm">
                                <span className="font-medium">{paketNama}</span>
                                <button type="button" onClick={() => setPaketId(null)} className="shrink-0 text-xs text-primary">Ganti</button>
                            </div>
                        )}
                    </section>

                    <section className="flex flex-col gap-2">
                        <span className="text-sm font-semibold">Cerita singkat</span>
                        <textarea value={caption} maxLength={CAPTION_MAKS} onChange={(e) => setCaption(e.target.value)} rows={3} placeholder="Apa yang terjadi di lapangan hari ini?" className="rounded-xl border bg-background p-3 text-base outline-none focus:ring-2 focus:ring-ring" />
                        <span className="text-right text-xs text-muted-foreground">{caption.length}/{CAPTION_MAKS}</span>
                    </section>

                    <section className="flex flex-col gap-2">
                        <span className="text-sm font-semibold">Lokasi</span>
                        <button type="button" onClick={ambilGps} disabled={mencariGps} className="flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-medium disabled:opacity-60">
                            {mencariGps ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <MapPin className="h-4 w-4" aria-hidden />}
                            {koordinat ? `Lokasi: ${koordinat}` : 'Ambil lokasi saat ini'}
                        </button>
                    </section>

                    {galat ? <p role="alert" className="text-sm text-red-600">{galat}</p> : null}
                </div>
            </div>
        </div>
    )
}
