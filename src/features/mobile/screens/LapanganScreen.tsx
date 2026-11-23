import { useEffect, useMemo, useRef, useState } from 'react'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Camera, Loader2, MapPin, Plus, ShieldCheck, X } from 'lucide-react'
import { createFoto, getFotoList } from '@/features/foto/api'
import { getFotoThumbUrl, normalizeStorageUrl } from '@/features/foto/lib/foto-url'
import type { Foto } from '@/features/foto/types'
import { getOutput } from '@/features/output/api/output'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'
import { useAppSettingsValues } from '@/hooks/use-app-settings'

const TAHAP = ['0%', '25%', '50%', '75%', '100%'] as const
const CAPTION_MAKS = 500
const PER_HALAMAN = 10

function waktu(iso?: string) {
    if (!iso) return ''
    return new Date(iso).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

/** Feed foto lapangan: setiap foto adalah satu "posting" yang terhubung ke paket. */
export function LapanganScreen() {
    const { tahunAnggaran } = useAppSettingsValues()
    const [buka, setBuka] = useState(false)

    const feed = useInfiniteQuery({
        queryKey: ['mobile-lapangan-feed', tahunAnggaran],
        queryFn: ({ pageParam }) => getFotoList({ page: pageParam, per_page: PER_HALAMAN, tahun: tahunAnggaran }),
        initialPageParam: 1,
        getNextPageParam: (last) => {
            const m = last.meta
            return m && m.current_page !== undefined && m.last_page !== undefined && m.current_page < m.last_page ? m.current_page + 1 : undefined
        },
        staleTime: 20_000,
    })

    const daftar: Foto[] = feed.data?.pages.flatMap((h) => h.data ?? []) ?? []

    return (
        <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-28 pt-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Lapangan</h1>
                    <p className="text-xs text-muted-foreground">Kabar terbaru dari lapangan</p>
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
                    {daftar.map((f) => (
                        <li key={f.id} className="overflow-hidden rounded-2xl border bg-background">
                            <div className="relative bg-muted">
                                <img
                                    src={getFotoThumbUrl({ foto_url: normalizeStorageUrl(f.foto_url), foto_thumb_url: f.foto_thumb_url ? normalizeStorageUrl(f.foto_thumb_url) : undefined })}
                                    alt={`Foto paket ${f.pekerjaan_id}`}
                                    className="aspect-[4/3] w-full object-cover"
                                    loading="lazy"
                                />
                                <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold">Fisik {f.keterangan}</span>
                                {f.validasi_koordinat ? (
                                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                                        <ShieldCheck className="h-3 w-3" aria-hidden /> Terverifikasi
                                    </span>
                                ) : null}
                            </div>
                            <div className="flex flex-col gap-2 p-4">
                                <Link to={'/m/proyek/$id' as never} params={{ id: String(f.pekerjaan_id) } as never} className="text-sm font-semibold leading-snug">
                                    {f.pekerjaan?.nama_paket ?? `Paket #${f.pekerjaan_id}`}
                                </Link>
                                {f.caption ? <p className="text-sm leading-relaxed">{f.caption}</p> : null}
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" aria-hidden />{f.koordinat || 'Lokasi belum ada'}</span>
                                    <span>{waktu(f.created_at)}</span>
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

            {buka ? <Posting tahun={tahunAnggaran} onTutup={() => setBuka(false)} /> : null}
        </main>
    )
}

function Posting({ tahun, onTutup }: { tahun: string; onTutup: () => void }) {
    const qc = useQueryClient()
    const inputFoto = useRef<HTMLInputElement>(null)
    const [berkas, setBerkas] = useState<File | null>(null)
    const [pratinjau, setPratinjau] = useState<string | null>(null)
    const [cari, setCari] = useState('')
    const [kataCari, setKataCari] = useState('')
    const [paketId, setPaketId] = useState<number | null>(null)
    const [paketNama, setPaketNama] = useState('')
    const [komponenId, setKomponenId] = useState<number | null>(null)
    const [tahap, setTahap] = useState<(typeof TAHAP)[number]>('0%')
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
        queryFn: () => getPekerjaan({ search: kataCari, per_page: 6, tahun, status: 'active' }),
        enabled: kataCari.length >= 3 && paketId === null,
    })

    const komponen = useQuery({
        queryKey: ['mobile-posting-komponen', paketId],
        queryFn: () => getOutput({ pekerjaan_id: paketId! }),
        enabled: paketId !== null,
    })
    const daftarKomponen = useMemo(() => (komponen.data?.data ?? []), [komponen.data])
    const komponenTerpilih = daftarKomponen.find((o) => o.id === komponenId)

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
            if (!berkas || paketId === null || komponenId === null || !koordinat) throw new Error('Lengkapi foto, paket, komponen, dan lokasi.')
            const fd = new FormData()
            fd.append('file', berkas)
            fd.append('pekerjaan_id', String(paketId))
            fd.append('komponen_id', String(komponenId))
            fd.append('keterangan', tahap)
            fd.append('koordinat', koordinat)
            if (caption.trim()) fd.append('caption', caption.trim())
            return createFoto(fd)
        },
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['mobile-lapangan-feed'] })
            onTutup()
        },
        onError: (e: Error) => setGalat(e.message || 'Posting gagal. Coba lagi.'),
    })

    const siap = !!berkas && paketId !== null && komponenId !== null && !!koordinat && !kirim.isPending

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
                        <span className="text-sm font-semibold">Paket</span>
                        {paketId === null ? (
                            <>
                                <input type="search" value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama paket (min. 3 huruf)" className="h-11 rounded-xl border bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring" />
                                <ul className="divide-y rounded-xl border">
                                    {(hasilPaket.data?.data ?? []).map((p) => (
                                        <li key={p.id}>
                                            <button type="button" onClick={() => { setPaketId(p.id); setPaketNama(p.nama_paket); setKomponenId(null) }} className="flex w-full flex-col items-start px-4 py-3 text-left">
                                                <span className="text-sm font-medium">{p.nama_paket}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <div className="flex items-start justify-between gap-2 rounded-xl border p-3 text-sm">
                                <span className="font-medium">{paketNama}</span>
                                <button type="button" onClick={() => { setPaketId(null); setKomponenId(null) }} className="shrink-0 text-xs text-primary">Ganti</button>
                            </div>
                        )}
                    </section>

                    {paketId !== null ? (
                        <section className="flex flex-col gap-2">
                            <span className="text-sm font-semibold">Komponen</span>
                            {komponen.isLoading ? <p className="text-sm text-muted-foreground">Memuat komponen…</p> : daftarKomponen.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Paket ini belum punya komponen.</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {daftarKomponen.map((o) => {
                                        const bisa = o.penerima_is_optional
                                        return (
                                            <button key={o.id} type="button" disabled={!bisa} onClick={() => setKomponenId(o.id)} className={`flex flex-col items-start rounded-xl border px-4 py-3 text-left text-sm ${komponenId === o.id ? 'border-primary bg-primary/5' : ''} ${bisa ? '' : 'opacity-50'}`}>
                                                <span className="font-medium">{o.komponen}</span>
                                                {!bisa ? <span className="text-xs text-muted-foreground">Butuh penerima, isi lewat form web</span> : null}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </section>
                    ) : null}

                    <section className="flex flex-col gap-2">
                        <span className="text-sm font-semibold">Tahap fisik</span>
                        <div className="flex flex-wrap gap-2">
                            {TAHAP.map((t) => (
                                <button key={t} type="button" onClick={() => setTahap(t)} className={`rounded-full border px-3.5 py-1.5 text-sm ${tahap === t ? 'border-primary bg-primary text-primary-foreground' : ''}`}>{t}</button>
                            ))}
                        </div>
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
                    {komponenTerpilih ? <p className="text-xs text-muted-foreground">Komponen: {komponenTerpilih.komponen}</p> : null}
                </div>
            </div>
        </div>
    )
}
