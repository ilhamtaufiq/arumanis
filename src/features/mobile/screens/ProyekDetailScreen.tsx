import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Camera, FileText, MapPin, ShieldCheck } from 'lucide-react'
import api from '@/lib/api-client'
import { formatCurrency } from '@/features/dashboard/lib/format'
import { getFotoThumbUrl, normalizeStorageUrl } from '@/features/foto/lib/foto-url'
import { useAppSettingsValues } from '@/hooks/use-app-settings'

type Titik = { tanggal?: string; persen?: number | string | null }
type Bagian = { latest_rencana?: number | null; latest_realisasi?: number | null; deviasi?: number | null; rencana?: Titik[]; realisasi?: Titik[] }
type Estimasi = { fisik?: Bagian; keuangan?: Bagian }

type Foto = { id: number; foto_url: string; foto_thumb_url?: string | null; koordinat?: string; validasi_koordinat?: boolean; created_at?: string; komponen?: { nama?: string } | null }
type Berkas = { id: number; jenis_dokumen?: string | null; original_name?: string | null; berkas_url?: string }
type Kontrak = { id: number; kode_paket?: string | null; nilai_kontrak?: number | string | null; tgl_spmk?: string | null; tgl_selesai?: string | null; penyedia?: { nama?: string } | null }
type Detail = {
    id: number
    nama_paket: string
    pagu?: number | string | null
    kecamatan?: { nama_kecamatan?: string } | null
    desa?: { nama_desa?: string } | null
    kegiatan?: { nama_sub_kegiatan?: string } | null
    kontrak?: Kontrak[]
    foto?: Foto[]
    berkas?: Berkas[]
    usulan_penyedia?: { nama?: string } | null
    progress_estimasi_fisik?: number | null
    progress_estimasi_keuangan?: number | null
    deviasi_estimasi_fisik?: number | null
}

const persen = (n: number | null | undefined) => (n == null ? '–' : `${Number(n).toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`)

function Bar({ nilai, merah }: { nilai: number; merah?: boolean }) {
    return (
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
            <div className={`h-full rounded-full ${merah ? 'bg-red-600' : 'bg-primary'}`} style={{ width: `${Math.min(100, Math.max(0, nilai))}%` }} />
        </div>
    )
}

/** Kurva S sederhana dari riwayat rencana dan realisasi (tanpa pustaka grafik). */
function KurvaS({ rencana, realisasi }: { rencana: Titik[]; realisasi: Titik[] }) {
    const semua = [...rencana, ...realisasi].filter((t) => t.tanggal && t.persen != null)
    if (semua.length < 2) return <p className="text-xs text-muted-foreground">Riwayat progres belum cukup untuk grafik.</p>
    const urut = (arr: Titik[]) => arr.filter((t) => t.tanggal && t.persen != null).sort((a, b) => (a.tanggal! < b.tanggal! ? -1 : 1))
    const tanggal = [...new Set(semua.map((t) => t.tanggal!))].sort()
    const jalur = (arr: Titik[]) => {
        const u = urut(arr)
        return u.map((t) => {
            const x = (tanggal.indexOf(t.tanggal!) / Math.max(1, tanggal.length - 1)) * 300
            const y = 110 - (Number(t.persen) / 100) * 100
            return `${x.toFixed(1)},${y.toFixed(1)}`
        }).join(' ')
    }
    return (
        <svg viewBox="0 0 300 120" className="h-32 w-full" role="img" aria-label="Kurva S rencana dan realisasi">
            <line x1="0" y1="110" x2="300" y2="110" className="stroke-border" strokeWidth="1" />
            <polyline points={jalur(rencana)} fill="none" className="stroke-muted-foreground" strokeWidth="2" strokeDasharray="4 3" />
            <polyline points={jalur(realisasi)} fill="none" className="stroke-primary" strokeWidth="2.5" />
        </svg>
    )
}

export function ProyekDetailScreen({ id }: { id: number }) {
    const { tahunAnggaran } = useAppSettingsValues()

    const detail = useQuery({
        queryKey: ['mobile-proyek-detail', id],
        queryFn: async () => (await api.get<{ data: Detail } | Detail>(`/pekerjaan/${id}`)) as unknown,
        staleTime: 30_000,
    })
    const estimasi = useQuery({
        queryKey: ['mobile-proyek-estimasi', id, tahunAnggaran],
        queryFn: async () => (await api.get<{ data: Estimasi }>(`/pekerjaan/${id}/progress-estimasi`, { params: { tahun: tahunAnggaran } })) as unknown,
        staleTime: 30_000,
    })

    const raw = detail.data as { data?: Detail } | Detail | undefined
    const p: Detail | undefined = raw ? ('data' in raw && raw.data ? raw.data : (raw as Detail)) : undefined
    const es = (estimasi.data as { data?: Estimasi } | undefined)?.data
    const fisik = es?.fisik
    const keuangan = es?.keuangan

    if (detail.isLoading) return <p className="py-10 text-center text-sm text-muted-foreground">Memuat paket…</p>
    if (detail.isError || !p) {
        return (
            <div className="flex flex-col items-center gap-3 p-6 text-center">
                <p className="text-sm text-red-600">Detail paket tidak bisa dimuat.</p>
                <Link to={'/m/proyek' as never} className="rounded-full border px-4 py-1.5 text-sm">Kembali ke proyek</Link>
            </div>
        )
    }

    const lokasi = [p.desa?.nama_desa, p.kecamatan?.nama_kecamatan].filter(Boolean).join(', ')
    const deviasi = Number(p.deviasi_estimasi_fisik ?? fisik?.deviasi ?? 0)
    const kontrak = p.kontrak?.[0]
    const penyedia = kontrak?.penyedia?.nama ?? p.usulan_penyedia?.nama ?? '–'
    const fotoList = p.foto ?? []
    const berkasList = p.berkas ?? []

    return (
        <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pb-28 pt-3">
            <div className="flex items-center justify-between">
                <Link to={'/m/proyek' as never} className="flex items-center gap-1 text-sm font-medium">
                    <ArrowLeft className="h-4 w-4" aria-hidden /> Daftar proyek
                </Link>
                <span className="text-xs text-muted-foreground">TA {tahunAnggaran || '–'}</span>
            </div>

            <section className="flex flex-col gap-2">
                <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${deviasi < 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {deviasi < 0 ? `Tertinggal ${persen(deviasi)}` : deviasi > 0 ? `Surplus +${persen(deviasi)}` : 'Sesuai target'}
                </span>
                <h1 className="text-xl font-bold leading-snug tracking-tight">{p.nama_paket}</h1>
                <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <span>{lokasi || 'Lokasi belum diisi'}</span>
                </p>
                {p.kegiatan?.nama_sub_kegiatan ? <p className="text-xs text-muted-foreground">{p.kegiatan.nama_sub_kegiatan}</p> : null}
            </section>

            <section aria-label="Progres fisik dan finansial" className="flex flex-col gap-4 rounded-xl border bg-background p-4">
                <h2 className="text-sm font-semibold">Progres fisik & finansial</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs text-muted-foreground">Realisasi fisik</span>
                        <span className="text-2xl font-bold tabular-nums">{persen(fisik?.latest_realisasi ?? p.progress_estimasi_fisik)}</span>
                        <span className="text-xs text-muted-foreground">rencana {persen(fisik?.latest_rencana)}</span>
                        <Bar nilai={Number(fisik?.latest_realisasi ?? p.progress_estimasi_fisik ?? 0)} merah={deviasi < 0} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs text-muted-foreground">Serapan keuangan</span>
                        <span className="text-2xl font-bold tabular-nums">{persen(keuangan?.latest_realisasi ?? p.progress_estimasi_keuangan)}</span>
                        <span className="text-xs text-muted-foreground">dari pagu {formatCurrency(Number(p.pagu ?? 0))}</span>
                        <Bar nilai={Number(keuangan?.latest_realisasi ?? p.progress_estimasi_keuangan ?? 0)} />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium">Kurva S</span>
                    <KurvaS rencana={fisik?.rencana ?? []} realisasi={fisik?.realisasi ?? []} />
                    <div className="flex gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><span className="inline-block h-0.5 w-4 border-t-2 border-dashed" />Rencana</span>
                        <span className="flex items-center gap-1"><span className="inline-block h-0.5 w-4 bg-primary" />Realisasi</span>
                    </div>
                </div>
            </section>

            <section aria-label="Kontrak dan penyedia" className="flex flex-col gap-3 rounded-xl border bg-background p-4">
                <h2 className="text-sm font-semibold">Kontrak & penyedia</h2>
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Nilai kontrak</span>
                    <span className="text-xl font-bold tabular-nums">{kontrak?.nilai_kontrak ? formatCurrency(Number(kontrak.nilai_kontrak)) : '–'}</span>
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div><dt className="text-xs text-muted-foreground">Penyedia</dt><dd className="font-medium">{penyedia}</dd></div>
                    <div><dt className="text-xs text-muted-foreground">Kode paket</dt><dd className="font-medium">{kontrak?.kode_paket ?? '–'}</dd></div>
                    <div><dt className="text-xs text-muted-foreground">SPMK</dt><dd className="font-medium">{kontrak?.tgl_spmk ?? '–'}</dd></div>
                    <div><dt className="text-xs text-muted-foreground">Target selesai</dt><dd className="font-medium">{kontrak?.tgl_selesai ?? '–'}</dd></div>
                </dl>
            </section>

            <section aria-label="Dokumentasi lapangan" className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Dokumentasi lapangan</h2>
                    <span className="text-xs text-muted-foreground">{fotoList.length} foto</span>
                </div>
                {fotoList.length === 0 ? (
                    <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">Belum ada foto lapangan.</p>
                ) : (
                    <ul className="grid grid-cols-2 gap-2">
                        {fotoList.slice(0, 6).map((f) => (
                            <li key={f.id} className="relative overflow-hidden rounded-xl border bg-muted">
                                <img src={getFotoThumbUrl({ foto_url: normalizeStorageUrl(f.foto_url), foto_thumb_url: f.foto_thumb_url ? normalizeStorageUrl(f.foto_thumb_url) : undefined })} alt={f.komponen?.nama ?? `Foto ${f.id}`} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                                {f.validasi_koordinat ? (
                                    <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                        <ShieldCheck className="h-3 w-3" aria-hidden /> Terverifikasi
                                    </span>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section aria-label="Berkas" className="flex flex-col gap-2">
                <h2 className="text-sm font-semibold">Berkas</h2>
                {berkasList.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Belum ada berkas.</p>
                ) : (
                    <ul className="divide-y rounded-xl border bg-background">
                        {berkasList.map((b) => (
                            <li key={b.id}>
                                <a href={normalizeStorageUrl(b.berkas_url ?? '')} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 text-sm">
                                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                                    <span className="min-w-0 truncate">{b.original_name ?? b.jenis_dokumen ?? `Berkas ${b.id}`}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <div className="fixed inset-x-0 z-30 border-t bg-background/95 p-3 backdrop-blur" style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
                <Link to={'/pekerjaan/$id' as never} params={{ id: String(p.id) } as never} className="mx-auto flex h-12 max-w-md items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-primary-foreground">
                    <Camera className="h-5 w-5" aria-hidden /> Input progres & foto
                </Link>
            </div>
        </main>
    )
}
