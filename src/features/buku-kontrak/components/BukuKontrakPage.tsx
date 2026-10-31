import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
    ArrowDown,
    ArrowUp,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    FolderOpen,
    Loader2,
    Save,
    Trash2,
    Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { SearchableSelect } from '@/components/ui/searchable-select'
import PageContainer from '@/components/layout/page-container'
import { createBerkas } from '@/features/berkas/api'
import type { Berkas } from '@/features/berkas/types'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'
import type { Pekerjaan } from '@/features/pekerjaan/types'
import { normalizeStorageUrl } from '@/features/foto/lib/foto-url'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { bacaPdf, gabungkanPdf, type PilihanHalaman, type SumberPdf } from '../lib/pdf-utils'
import { renderThumbnail } from '../lib/pdf-thumbnail'
import { BerkasPdfPicker } from './BerkasPdfPicker'

/** Batas ukuran upload berkas di backend (`media::MAX_FILE_BYTES`, 50 MB). */
const BATAS_UPLOAD_BYTES = 51_200 * 1024

/** Jenis dokumen berkas hasil buku kontrak. */
export const JENIS_BUKU_KONTRAK = 'Buku Kontrak'

const kunciHalaman = (sumberId: string, halaman: number) => `${sumberId}:${halaman}`

type Pilihan = { sumberId: string; halaman: number }

export default function BukuKontrakPage() {
    const queryClient = useQueryClient()
    const inputRef = useRef<HTMLInputElement>(null)
    const [sumber, setSumber] = useState<SumberPdf[]>([])
    const [dikecualikan, setDikecualikan] = useState<Set<string>>(new Set())
    const [thumbs, setThumbs] = useState<Record<string, string>>({})
    const [dipilih, setDipilih] = useState<Pilihan | null>(null)
    const [pratinjau, setPratinjau] = useState<string | null>(null)
    const [pratinjauMemuat, setPratinjauMemuat] = useState(false)
    const [pekerjaanId, setPekerjaanId] = useState('')
    const [membaca, setMembaca] = useState(false)
    const [menyimpan, setMenyimpan] = useState(false)
    const [pickerOpen, setPickerOpen] = useState(false)

    const { data: pekerjaanList = [] } = useQuery({
        queryKey: ['buku-kontrak', 'pekerjaan'],
        queryFn: async () => {
            // Ambil semua halaman pekerjaan aktif, bukan hanya 100 pertama.
            const semua: Pekerjaan[] = []
            let page = 1
            let lastPage = 1
            do {
                const res = await getPekerjaan({ page, per_page: 100, status: 'active' })
                semua.push(...res.data)
                lastPage = res.meta?.last_page ?? page
                page += 1
            } while (page <= lastPage)
            return semua
        },
    })
    const pilihanPekerjaan = useMemo(
        () =>
            pekerjaanList.map((p) => ({
                value: String(p.id),
                label: p.nama_paket,
                keywords: p.kode_rekening ?? undefined,
            })),
        [pekerjaanList],
    )

    // Render thumbnail satu per satu di latar belakang. Halaman yang sudah jadi tidak diulang.
    const sudahDirender = useRef<Set<string>>(new Set())
    useEffect(() => {
        let batal = false
        ;(async () => {
            for (const s of sumber) {
                for (let h = 0; h < s.jumlahHalaman; h++) {
                    if (batal) return
                    const kunci = kunciHalaman(s.id, h)
                    if (sudahDirender.current.has(kunci)) continue
                    sudahDirender.current.add(kunci)
                    try {
                        const gambar = await renderThumbnail(s.id, s.bytes, h, 160)
                        if (!batal) setThumbs((t) => ({ ...t, [kunci]: gambar }))
                    } catch {
                        // Halaman yang gagal dirender tetap bisa dipilih tanpa pratinjau.
                    }
                }
            }
        })()
        return () => {
            batal = true
        }
    }, [sumber])

    // Pratinjau besar untuk halaman yang dipilih.
    useEffect(() => {
        if (!dipilih) {
            setPratinjau(null)
            return
        }
        const src = sumber.find((s) => s.id === dipilih.sumberId)
        if (!src) return
        let batal = false
        setPratinjauMemuat(true)
        renderThumbnail(src.id, src.bytes, dipilih.halaman, 900)
            .then((gambar) => {
                if (!batal) setPratinjau(gambar)
            })
            .catch(() => {
                if (!batal) setPratinjau(null)
            })
            .finally(() => {
                if (!batal) setPratinjauMemuat(false)
            })
        return () => {
            batal = true
        }
    }, [dipilih, sumber])

    // Halaman berurutan dari semua file, untuk navigasi sebelum/sesudah di pratinjau.
    const semuaHalaman = useMemo(
        () =>
            sumber.flatMap((s) =>
                Array.from({ length: s.jumlahHalaman }, (_, h) => ({ sumberId: s.id, halaman: h })),
            ),
        [sumber],
    )
    const indeksDipilih = dipilih
        ? semuaHalaman.findIndex((p) => p.sumberId === dipilih.sumberId && p.halaman === dipilih.halaman)
        : -1
    const pindahPratinjau = (arah: -1 | 1) => {
        const j = indeksDipilih + arah
        if (j >= 0 && j < semuaHalaman.length) setDipilih(semuaHalaman[j])
    }

    const totalHalaman = sumber.reduce((a, s) => a + s.jumlahHalaman, 0)
    const halamanDipilih = sumber.reduce(
        (a, s) =>
            a + Array.from({ length: s.jumlahHalaman }, (_, h) => h).filter((h) => !dikecualikan.has(kunciHalaman(s.id, h))).length,
        0,
    )

    /** Tambahkan file ke daftar sumber. Dipakai untuk upload dari perangkat dan untuk berkas pekerjaan. */
    const tambahFile = async (daftar: File[]) => {
        setMembaca(true)
        try {
            const baru: SumberPdf[] = []
            for (const file of daftar) {
                if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
                    toast.error(`${file.name} bukan berkas PDF.`)
                    continue
                }
                try {
                    baru.push(await bacaPdf(file))
                } catch {
                    toast.error(`${file.name} tidak bisa dibaca (rusak atau terkunci password).`)
                }
            }
            if (baru.length > 0) {
                setSumber((s) => [...s, ...baru])
                if (!dipilih) setDipilih({ sumberId: baru[0].id, halaman: 0 })
            }
        } finally {
            setMembaca(false)
        }
    }

    const handleTambahFile = async (daftar: FileList | null) => {
        if (!daftar) return
        await tambahFile(Array.from(daftar))
        if (inputRef.current) inputRef.current.value = ''
    }

    /** Unduh berkas PDF yang dipilih dari berkas pekerjaan, lalu tambahkan seperti upload biasa. */
    const ambilDariBerkas = async (pilih: Berkas[]) => {
        setMembaca(true)
        const files: File[] = []
        try {
            for (const b of pilih) {
                try {
                    const res = await fetch(normalizeStorageUrl(b.berkas_url))
                    if (!res.ok) throw new Error(`status ${res.status}`)
                    const nama = b.original_name || b.file_name || `berkas_${b.id}.pdf`
                    files.push(new File([await res.blob()], nama, { type: 'application/pdf' }))
                } catch {
                    toast.error(`${b.original_name || b.file_name || `berkas ${b.id}`} tidak bisa diunduh.`)
                }
            }
        } finally {
            setMembaca(false)
        }
        await tambahFile(files)
    }

    const pindah = (index: number, arah: -1 | 1) =>
        setSumber((s) => {
            const j = index + arah
            if (j < 0 || j >= s.length) return s
            const n = [...s]
            ;[n[index], n[j]] = [n[j], n[index]]
            return n
        })

    const hapusSumber = (id: string) => {
        setSumber((s) => s.filter((x) => x.id !== id))
        setDikecualikan((d) => new Set([...d].filter((k) => !k.startsWith(`${id}:`))))
        setDipilih((p) => (p && p.sumberId === id ? null : p))
    }

    const togglePilihan = (sumberId: string, halaman: number) =>
        setDikecualikan((d) => {
            const n = new Set(d)
            const kunci = kunciHalaman(sumberId, halaman)
            if (n.has(kunci)) n.delete(kunci)
            else n.add(kunci)
            return n
        })

    const sertakanSemua = () => setDikecualikan(new Set())

    const handleSimpan = async () => {
        if (!pekerjaanId) {
            toast.error('Pilih pekerjaan tujuan dulu.')
            return
        }
        const pilihan: PilihanHalaman[] = sumber.map((s) => ({
            sumberId: s.id,
            halaman: Array.from({ length: s.jumlahHalaman }, (_, h) => h).filter(
                (h) => !dikecualikan.has(kunciHalaman(s.id, h)),
            ),
        }))
        const total = pilihan.reduce((a, g) => a + g.halaman.length, 0)
        if (total === 0) {
            toast.error('Tidak ada halaman yang dipilih.')
            return
        }

        const nama = pekerjaanList.find((p) => String(p.id) === pekerjaanId)?.nama_paket ?? 'pekerjaan'
        setMenyimpan(true)
        try {
            const bytes = await gabungkanPdf(sumber, pilihan)
            if (bytes.byteLength > BATAS_UPLOAD_BYTES) {
                const mb = (bytes.byteLength / (1024 * 1024)).toFixed(1)
                toast.error(`Hasil gabungan ${mb} MB melebihi batas upload 50 MB. Kurangi halaman atau berkas.`)
                return
            }
            const file = new File([new Blob([bytes], { type: 'application/pdf' })], `Buku Kontrak - ${nama}.pdf`, {
                type: 'application/pdf',
            })
            const fd = new FormData()
            fd.append('pekerjaan_id', pekerjaanId)
            fd.append('jenis_dokumen', JENIS_BUKU_KONTRAK)
            fd.append('file', file)
            await createBerkas(fd)
            await queryClient.invalidateQueries({ queryKey: ['berkas'] })
            toast.success(`Buku kontrak (${total} halaman) disimpan di berkas pekerjaan.`)
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Gagal menyimpan buku kontrak'))
        } finally {
            setMenyimpan(false)
        }
    }

    const dipilihAktif = dipilih !== null && !dikecualikan.has(kunciHalaman(dipilih.sumberId, dipilih.halaman))
    const namaSumberDipilih = dipilih ? sumber.find((s) => s.id === dipilih.sumberId)?.nama : undefined

    return (
        <PageContainer>
            <div className="space-y-4">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-bold tracking-tight">
                        <BookOpen className="h-6 w-6 text-primary" />
                        Buku Kontrak
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base">
                        Tambahkan beberapa PDF, atur urutan dan halaman, lalu simpan hasil gabungannya sebagai berkas pekerjaan.
                    </p>
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-medium">Pekerjaan tujuan</p>
                    <SearchableSelect
                        options={pilihanPekerjaan}
                        value={pekerjaanId}
                        onValueChange={setPekerjaanId}
                        placeholder="Pilih pekerjaan..."
                        searchPlaceholder="Cari nama paket atau kode rekening..."
                        emptyMessage="Pekerjaan tidak ditemukan."
                        className="w-full max-w-xl"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" className="gap-2" onClick={() => inputRef.current?.click()} disabled={membaca}>
                        {membaca ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        Upload PDF
                    </Button>
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => setPickerOpen(true)}
                        disabled={membaca || pekerjaanId === ''}
                        title={pekerjaanId === '' ? 'Pilih pekerjaan tujuan dulu' : undefined}
                    >
                        <FolderOpen className="h-4 w-4" />
                        Pilih dari berkas pekerjaan
                    </Button>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        multiple
                        className="hidden"
                        onChange={(e) => void handleTambahFile(e.target.files)}
                    />
                    <span className="text-sm text-muted-foreground">
                        {sumber.length} berkas · {halamanDipilih} dari {totalHalaman} halaman dipilih
                    </span>
                </div>

                {sumber.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
                        Belum ada PDF. Tambahkan file untuk mulai.
                    </p>
                ) : (
                    <div className="flex h-[75vh] min-h-[480px] flex-col overflow-hidden rounded-lg border md:flex-row">
                        {/* Panel kiri: daftar halaman per berkas */}
                        <aside className="flex max-h-[40vh] w-full shrink-0 flex-col border-b md:max-h-none md:w-64 md:border-b-0 md:border-r">
                            <div className="flex items-center justify-between border-b px-3 py-2 text-sm font-medium">
                                <span>Halaman</span>
                                <Button variant="ghost" size="sm" onClick={sertakanSemua} className="h-7 px-2 text-xs">
                                    Sertakan semua
                                </Button>
                            </div>
                            <div className="flex-1 space-y-4 overflow-y-auto p-2">
                                {sumber.map((s, index) => (
                                    <section key={s.id} className="space-y-2">
                                        <div className="flex items-center justify-between gap-1">
                                            <p className="min-w-0 truncate text-xs font-semibold" title={s.nama}>
                                                {index + 1}. {s.nama}
                                            </p>
                                            <div className="flex shrink-0">
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => pindah(index, -1)} disabled={index === 0} aria-label="Naikkan urutan">
                                                    <ArrowUp className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => pindah(index, 1)} disabled={index === sumber.length - 1} aria-label="Turunkan urutan">
                                                    <ArrowDown className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => hapusSumber(s.id)} aria-label="Hapus berkas">
                                                    <Trash2 className="h-3 w-3 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Array.from({ length: s.jumlahHalaman }, (_, h) => {
                                                const kunci = kunciHalaman(s.id, h)
                                                const aktif = !dikecualikan.has(kunci)
                                                const terpilih = dipilih?.sumberId === s.id && dipilih.halaman === h
                                                return (
                                                    <div
                                                        key={kunci}
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={() => setDipilih({ sumberId: s.id, halaman: h })}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') setDipilih({ sumberId: s.id, halaman: h })
                                                        }}
                                                        className={`cursor-pointer rounded-md border p-1 text-xs ${terpilih ? 'border-primary ring-1 ring-primary' : ''} ${aktif ? '' : 'opacity-40'}`}
                                                    >
                                                        <div className="flex aspect-[1/1.4] items-center justify-center overflow-hidden rounded bg-muted">
                                                            {thumbs[kunci] ? (
                                                                <img src={thumbs[kunci]} alt={`Halaman ${h + 1}`} className="h-full w-full object-contain" />
                                                            ) : (
                                                                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <div className="mt-1 flex items-center justify-between">
                                                            <span>Hal {h + 1}</span>
                                                            <input
                                                                type="checkbox"
                                                                checked={aktif}
                                                                onClick={(e) => e.stopPropagation()}
                                                                onChange={() => togglePilihan(s.id, h)}
                                                                aria-label={`Sertakan halaman ${h + 1}`}
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </section>
                                ))}
                            </div>
                        </aside>

                        {/* Panel kanan: pratinjau halaman yang dipilih */}
                        <section className="flex min-h-0 flex-1 flex-col">
                            <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
                                <p className="min-w-0 truncate text-sm font-medium">
                                    {dipilih
                                        ? `${namaSumberDipilih ?? ''} · halaman ${dipilih.halaman + 1} dari ${sumber.find((s) => s.id === dipilih.sumberId)?.jumlahHalaman ?? 0}`
                                        : 'Pilih halaman di panel kiri'}
                                </p>
                                <div className="flex shrink-0 items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => pindahPratinjau(-1)} disabled={indeksDipilih <= 0} aria-label="Halaman sebelumnya">
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => pindahPratinjau(1)} disabled={indeksDipilih < 0 || indeksDipilih >= semuaHalaman.length - 1} aria-label="Halaman berikutnya">
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    {dipilih ? (
                                        <Button
                                            variant={dipilihAktif ? 'outline' : 'default'}
                                            size="sm"
                                            className="ml-2 h-8"
                                            onClick={() => togglePilihan(dipilih.sumberId, dipilih.halaman)}
                                        >
                                            {dipilihAktif ? 'Keluarkan halaman' : 'Sertakan halaman'}
                                        </Button>
                                    ) : null}
                                </div>
                            </div>
                            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-muted/40 p-4">
                                {!dipilih ? (
                                    <p className="text-sm text-muted-foreground">Belum ada halaman yang dipilih.</p>
                                ) : pratinjauMemuat || !pratinjau ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                ) : (
                                    <img
                                        src={pratinjau}
                                        alt={`Pratinjau halaman ${dipilih.halaman + 1}`}
                                        className={`max-h-full max-w-full bg-white shadow ${dipilihAktif ? '' : 'opacity-40'}`}
                                    />
                                )}
                            </div>
                        </section>
                    </div>
                )}

                <div className="flex justify-end border-t pt-4">
                    <Button onClick={handleSimpan} disabled={menyimpan || sumber.length === 0} className="gap-2">
                        {menyimpan ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Gabungkan & simpan ke berkas
                    </Button>
                </div>
            </div>

            <BerkasPdfPicker
                open={pickerOpen}
                onOpenChange={setPickerOpen}
                pekerjaanId={pekerjaanId === '' ? null : Number(pekerjaanId)}
                onPilih={(pilih) => void ambilDariBerkas(pilih)}
            />
        </PageContainer>
    )
}
