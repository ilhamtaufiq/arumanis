import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, BookOpen, FolderOpen, Loader2, Save, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { SearchableSelect } from '@/components/ui/searchable-select'
import PageContainer from '@/components/layout/page-container'
import { createBerkas } from '@/features/berkas/api'
import type { Berkas } from '@/features/berkas/types'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'
import { normalizeStorageUrl } from '@/features/foto/lib/foto-url'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { bacaPdf, gabungkanPdf, type PilihanHalaman, type SumberPdf } from '../lib/pdf-utils'
import { renderThumbnail } from '../lib/pdf-thumbnail'
import { BerkasPdfPicker } from './BerkasPdfPicker'

/** Jenis dokumen berkas hasil buku kontrak. */
export const JENIS_BUKU_KONTRAK = 'Buku Kontrak'

const kunciHalaman = (sumberId: string, halaman: number) => `${sumberId}:${halaman}`

export default function BukuKontrakPage() {
    const queryClient = useQueryClient()
    const inputRef = useRef<HTMLInputElement>(null)
    const [sumber, setSumber] = useState<SumberPdf[]>([])
    const [dikecualikan, setDikecualikan] = useState<Set<string>>(new Set())
    const [thumbs, setThumbs] = useState<Record<string, string>>({})
    const [pekerjaanId, setPekerjaanId] = useState('')
    const [membaca, setMembaca] = useState(false)
    const [pickerOpen, setPickerOpen] = useState(false)
    const [menyimpan, setMenyimpan] = useState(false)

    const { data: pekerjaanList = [] } = useQuery({
        queryKey: ['buku-kontrak', 'pekerjaan'],
        queryFn: async () => (await getPekerjaan({ per_page: 100, status: 'active' })).data,
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
                        const gambar = await renderThumbnail(s.id, s.bytes, h)
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
            if (baru.length > 0) setSumber((s) => [...s, ...baru])
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
    const ambilDariBerkas = async (dipilih: Berkas[]) => {
        setMembaca(true)
        const files: File[] = []
        try {
            for (const b of dipilih) {
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
    }

    const togglePilihan = (sumberId: string, halaman: number) =>
        setDikecualikan((d) => {
            const n = new Set(d)
            const kunci = kunciHalaman(sumberId, halaman)
            if (n.has(kunci)) n.delete(kunci)
            else n.add(kunci)
            return n
        })

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

    return (
        <PageContainer>
            <div className="space-y-6">
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
                    <p className="text-muted-foreground">Belum ada PDF. Tambahkan file untuk mulai.</p>
                ) : (
                    <div className="space-y-8">
                        {sumber.map((s, index) => (
                            <section key={s.id} className="space-y-3 rounded-lg border p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="font-medium break-all">
                                            {index + 1}. {s.nama}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{s.jumlahHalaman} halaman</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => pindah(index, -1)} disabled={index === 0} aria-label="Naikkan urutan">
                                            <ArrowUp className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => pindah(index, 1)} disabled={index === sumber.length - 1} aria-label="Turunkan urutan">
                                            <ArrowDown className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => hapusSumber(s.id)} aria-label="Hapus berkas">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
                                    {Array.from({ length: s.jumlahHalaman }, (_, h) => {
                                        const kunci = kunciHalaman(s.id, h)
                                        const aktif = !dikecualikan.has(kunci)
                                        return (
                                            <label
                                                key={kunci}
                                                className={`flex cursor-pointer flex-col gap-1 rounded-md border p-1.5 text-xs ${aktif ? '' : 'opacity-40'}`}
                                            >
                                                <div className="flex aspect-[1/1.4] items-center justify-center overflow-hidden rounded bg-muted">
                                                    {thumbs[kunci] ? (
                                                        <img src={thumbs[kunci]} alt={`Halaman ${h + 1}`} className="h-full w-full object-contain" />
                                                    ) : (
                                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                    )}
                                                </div>
                                                <span className="flex items-center justify-between">
                                                    <span>Hal {h + 1}</span>
                                                    <input type="checkbox" checked={aktif} onChange={() => togglePilihan(s.id, h)} />
                                                </span>
                                            </label>
                                        )
                                    })}
                                </div>
                            </section>
                        ))}
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
                onPilih={(dipilih) => void ambilDariBerkas(dipilih)}
            />
        </PageContainer>
    )
}
