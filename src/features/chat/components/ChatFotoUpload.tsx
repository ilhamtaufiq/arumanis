import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Camera, Check, Loader2, MapPin, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { getGPSFromExif } from '@/lib/image-gps-utils'
import { formatKoordinat } from '@/lib/koordinat-utils'
import { useKoordinatValidation } from '@/hooks/use-koordinat-validation'
import { createFoto } from '@/features/foto/api'
import { createOutput, getOutput } from '@/features/output/api/output'
import { createPenerima, getPenerimaList } from '@/features/penerima/api'
import type { Output } from '@/features/output/types'
import type { Penerima } from '@/features/penerima/types'

const PROGRESS_OPTIONS = ['0%', '25%', '50%', '75%', '100%'] as const

interface PaketRow {
    id: number
    nama_paket: string
}

interface ChatFotoUploadProps {
    open: boolean
    onClose: () => void
    paketName?: string | null
    paketId?: number | null
}

type Step = 1 | 2 | 3

/**
 * Wizard kirim foto dari chat:
 * 1) pilih paket (search, bukan ID manual),
 * 2) cek kelengkapan output/penerima + tambah inline bila kosong,
 * 3) foto — komponen/penerima auto bila tinggal satu pilihan.
 */
export default function ChatFotoUpload({ open, onClose, paketName, paketId }: ChatFotoUploadProps) {
    const queryClient = useQueryClient()
    const [step, setStep] = useState<Step>(1)

    // Langkah 1: paket
    const [paketSearch, setPaketSearch] = useState(paketName ?? '')
    const [paketOptions, setPaketOptions] = useState<PaketRow[]>([])
    const [searching, setSearching] = useState(false)
    const [pid, setPid] = useState<number | null>(paketId ?? null)

    // Langkah 2: kelengkapan
    const [outputs, setOutputs] = useState<Output[]>([])
    const [penerimas, setPenerimas] = useState<Penerima[]>([])
    const [loadingMeta, setLoadingMeta] = useState(false)
    const [showOutputForm, setShowOutputForm] = useState(false)
    const [newKomponen, setNewKomponen] = useState('')
    const [newSatuan, setNewSatuan] = useState('Unit')
    const [newVolume, setNewVolume] = useState('1')
    const [showPenerimaForm, setShowPenerimaForm] = useState(false)
    const [newNama, setNewNama] = useState('')
    const [newJiwa, setNewJiwa] = useState('1')
    const [adding, setAdding] = useState(false)

    // Langkah 3: foto
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [komponenId, setKomponenId] = useState('')
    const [penerimaId, setPenerimaId] = useState('')
    const [keterangan, setKeterangan] = useState<string>('0%')
    const [koordinat, setKoordinat] = useState('')
    const [unitIndex, setUnitIndex] = useState('')
    const [saving, setSaving] = useState(false)

    const geoValidation = useKoordinatValidation(pid ?? undefined, koordinat)

    useEffect(() => {
        if (open) {
            setStep(1)
            setPaketSearch(paketName ?? '')
            setPid(paketId ?? null)
        }
    }, [open, paketName, paketId])

    if (!open) return null

    const searchPaket = async (q: string) => {
        setPaketSearch(q)
        if (q.trim().length < 3) {
            setPaketOptions([])
            return
        }
        setSearching(true)
        try {
            const res = await api.get<{ data: PaketRow[] }>('/pekerjaan', {
                params: { search: q.trim(), per_page: 6 },
            })
            setPaketOptions(Array.isArray(res.data) ? res.data : [])
        } catch {
            setPaketOptions([])
        } finally {
            setSearching(false)
        }
    }

    const loadMeta = async (id: number) => {
        setLoadingMeta(true)
        try {
            const [o, p] = await Promise.all([
                getOutput({ pekerjaan_id: id, per_page: -1 }).catch(() => null),
                getPenerimaList({ pekerjaan_id: id, per_page: -1 }).catch(() => null),
            ])
            const outList = o?.data ?? []
            const penList = p?.data ?? []
            setOutputs(outList)
            setPenerimas(penList)
            // Auto-pilih bila tunggal — user tak perlu memilih.
            setKomponenId(outList.length === 1 ? String(outList[0].id) : '')
            setPenerimaId(penList.length === 1 ? String(penList[0].id) : '')
        } finally {
            setLoadingMeta(false)
        }
    }

    const pickPaket = (id: number) => {
        setPid(id)
        setStep(2)
        void loadMeta(id)
    }

    const addOutput = async () => {
        if (!pid || !newKomponen.trim()) return toast.error('Isi nama komponen')
        const vol = Number(newVolume) || 1
        setAdding(true)
        try {
            const res = await createOutput({
                pekerjaan_id: pid,
                komponen: newKomponen.trim(),
                satuan: newSatuan.trim() || 'Unit',
                volume: vol,
                penerima_is_optional: false,
            })
            const created = res.data
            setOutputs((prev) => [...prev, created])
            setKomponenId(String(created.id))
            setNewKomponen('')
            setNewVolume('1')
            setShowOutputForm(false)
            toast.success('Komponen ditambahkan')
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Gagal menambah komponen')
        } finally {
            setAdding(false)
        }
    }

    const addPenerima = async () => {
        if (!pid || !newNama.trim()) return toast.error('Isi nama penerima')
        setAdding(true)
        try {
            const res = await createPenerima({
                pekerjaan_id: pid,
                nama: newNama.trim(),
                jumlah_jiwa: Number(newJiwa) || 1,
                nik: '',
                alamat: '',
                is_komunal: false,
            })
            const created = res.data
            setPenerimas((prev) => [...prev, created])
            setPenerimaId(String(created.id))
            setNewNama('')
            setNewJiwa('1')
            setShowPenerimaForm(false)
            toast.success('Penerima ditambahkan')
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Gagal menambah penerima')
        } finally {
            setAdding(false)
        }
    }

    const selectedOutput = outputs.find((o) => o.id.toString() === komponenId)
    const needPenerima = selectedOutput && !selectedOutput.penerima_is_optional
    const unitCount = (() => {
        if (!selectedOutput?.penerima_is_optional) return 1
        if (selectedOutput.satuan?.toLowerCase() !== 'unit') return 1
        return Math.max(1, Math.round(Number(selectedOutput.volume) || 1))
    })()

    const handleFile = async (f: File) => {
        setFile(f)
        setPreviewUrl(URL.createObjectURL(f))
        const extracting = toast.loading('Mengekstrak koordinat dari foto...')
        try {
            const coords = await getGPSFromExif(f)
            if (coords) {
                setKoordinat(coords)
                toast.success('Koordinat dari foto dipakai', { id: extracting })
            } else {
                toast.info('Foto tanpa GPS — isi manual atau pakai tombol GPS', { id: extracting })
            }
        } catch {
            toast.error('Gagal membaca EXIF', { id: extracting })
        }
    }

    const handleGps = () => {
        navigator.geolocation?.getCurrentPosition(
            (pos) => {
                setKoordinat(formatKoordinat(pos.coords.latitude, pos.coords.longitude))
                toast.success('Lokasi GPS dipakai')
            },
            () => toast.error('Gagal mendapatkan lokasi. Pastikan GPS aktif.'),
        )
    }

    const canToFoto = outputs.length > 0 && (!needPenerima || penerimaId || penerimas.length === 0)

    const handleSubmit = async () => {
        if (!pid) return toast.error('Pilih paket dulu')
        if (!komponenId) return toast.error('Pilih komponen')
        if (needPenerima && !penerimaId) return toast.error('Pilih penerima manfaat')
        if (unitCount > 1 && !unitIndex) return toast.error('Pilih nomor unit')
        if (!file) return toast.error('Pilih foto')
        if (!koordinat.trim()) return toast.error('Isi koordinat')

        setSaving(true)
        try {
            const formData = new FormData()
            formData.append('pekerjaan_id', String(pid))
            formData.append('komponen_id', komponenId)
            formData.append('keterangan', keterangan)
            if (unitIndex) formData.append('unit_index', unitIndex)
            formData.append('koordinat', koordinat)
            if (geoValidation && !geoValidation.loading) {
                formData.append('validasi_koordinat', geoValidation.isValid ? '1' : '0')
                formData.append('validasi_koordinat_message', geoValidation.message || '')
            }
            if (penerimaId) formData.append('penerima_id', penerimaId)
            formData.append('file', file)
            await createFoto(formData)
            toast.success('Foto terkirim ke paket')
            queryClient.invalidateQueries({ queryKey: ['fotos'] })
            onClose()
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Gagal mengunggah foto')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div
            role='dialog'
            aria-modal='true'
            aria-label='Kirim foto ke paket'
            className='fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4'
            onClick={onClose}
        >
            <div
                className='w-full max-w-lg rounded-2xl bg-background p-5 space-y-4 max-h-[90dvh] overflow-y-auto'
                onClick={(e) => e.stopPropagation()}
            >
                <div className='flex items-center justify-between'>
                    <h3 className='font-semibold flex items-center gap-2'>
                        <Camera className='w-4 h-4' /> Kirim Foto
                        <span className='text-xs font-normal text-muted-foreground'>Langkah {step}/3</span>
                    </h3>
                    <button type='button' onClick={onClose} className='rounded-full p-1.5 hover:bg-muted' title='Tutup'>
                        <X className='w-4 h-4' />
                    </button>
                </div>

                {/* Langkah 1: pilih paket */}
                {step === 1 && (
                    <div className='space-y-3'>
                        <div className='space-y-1.5'>
                            <Label>Cari paket pekerjaan</Label>
                            <Input
                                autoFocus
                                value={paketSearch}
                                onChange={(e) => void searchPaket(e.target.value)}
                                placeholder='Ketik ≥3 huruf nama paket...'
                            />
                        </div>
                        {searching && (
                            <p className='text-[13px] text-muted-foreground flex items-center gap-2'>
                                <Loader2 className='w-4 h-4 animate-spin' /> Mencari...
                            </p>
                        )}
                        {paketOptions.length > 0 && (
                            <ul className='overflow-hidden rounded-xl border divide-y divide-border/60'>
                                {paketOptions.map((p) => (
                                    <li key={p.id}>
                                        <button
                                            type='button'
                                            onClick={() => pickPaket(p.id)}
                                            className='w-full px-3.5 py-2.5 text-left text-[13px] hover:bg-muted flex items-center justify-between gap-2'
                                        >
                                            <span className='truncate'>{p.nama_paket}</span>
                                            <ArrowRight className='w-4 h-4 shrink-0 text-muted-foreground' />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {/* Langkah 2: cek kelengkapan */}
                {step === 2 && (
                    <div className='space-y-3'>
                        {loadingMeta ? (
                            <p className='text-[13px] text-muted-foreground flex items-center gap-2'>
                                <Loader2 className='w-4 h-4 animate-spin' /> Mengecek kelengkapan paket...
                            </p>
                        ) : (
                            <>
                                <div className={`rounded-xl border p-3 text-[13px] ${outputs.length > 0 ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>
                                    {outputs.length > 0 ? (
                                        <p className='flex items-center gap-2'><Check className='w-4 h-4' /> {outputs.length} komponen output tersedia.</p>
                                    ) : (
                                        <p>Belum ada komponen output — tambah dulu di bawah.</p>
                                    )}
                                </div>
                                {showOutputForm ? (
                                    <div className='rounded-xl border p-3 space-y-2'>
                                        <div className='grid grid-cols-2 gap-2'>
                                            <div className='col-span-2 space-y-1'>
                                                <Label>Nama komponen</Label>
                                                <Input value={newKomponen} onChange={(e) => setNewKomponen(e.target.value)} placeholder='cth: Sambungan Rumah' />
                                            </div>
                                            <div className='space-y-1'>
                                                <Label>Satuan</Label>
                                                <Input value={newSatuan} onChange={(e) => setNewSatuan(e.target.value)} />
                                            </div>
                                            <div className='space-y-1'>
                                                <Label>Volume</Label>
                                                <Input inputMode='numeric' value={newVolume} onChange={(e) => setNewVolume(e.target.value.replace(/[^\d.]/g, ''))} />
                                            </div>
                                        </div>
                                        <Button size='sm' disabled={adding} onClick={addOutput}>
                                            {adding ? <Loader2 className='w-3.5 h-3.5 animate-spin mr-1.5' /> : <Plus className='w-3.5 h-3.5 mr-1.5' />}
                                            Tambah komponen
                                        </Button>
                                    </div>
                                ) : (
                                    <Button size='sm' variant='outline' onClick={() => setShowOutputForm(true)}>
                                        <Plus className='w-3.5 h-3.5 mr-1.5' /> Tambah komponen
                                    </Button>
                                )}

                                <div className={`rounded-xl border p-3 text-[13px] ${penerimas.length > 0 ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-muted bg-muted/40 text-muted-foreground'}`}>
                                    {penerimas.length > 0 ? (
                                        <p className='flex items-center gap-2'><Check className='w-4 h-4' /> {penerimas.length} penerima terdaftar.</p>
                                    ) : (
                                        <p>Belum ada penerima (opsional bila komponen komunal).</p>
                                    )}
                                </div>
                                {showPenerimaForm ? (
                                    <div className='rounded-xl border p-3 space-y-2'>
                                        <div className='grid grid-cols-2 gap-2'>
                                            <div className='col-span-2 space-y-1'>
                                                <Label>Nama penerima</Label>
                                                <Input value={newNama} onChange={(e) => setNewNama(e.target.value)} placeholder='Nama lengkap' />
                                            </div>
                                            <div className='space-y-1'>
                                                <Label>Jumlah jiwa</Label>
                                                <Input inputMode='numeric' value={newJiwa} onChange={(e) => setNewJiwa(e.target.value.replace(/\D/g, ''))} />
                                            </div>
                                        </div>
                                        <Button size='sm' disabled={adding} onClick={addPenerima}>
                                            {adding ? <Loader2 className='w-3.5 h-3.5 animate-spin mr-1.5' /> : <Plus className='w-3.5 h-3.5 mr-1.5' />}
                                            Tambah penerima
                                        </Button>
                                    </div>
                                ) : (
                                    <Button size='sm' variant='outline' onClick={() => setShowPenerimaForm(true)}>
                                        <Plus className='w-3.5 h-3.5 mr-1.5' /> Tambah penerima
                                    </Button>
                                )}

                                <div className='flex gap-2'>
                                    <Button variant='ghost' size='sm' onClick={() => setStep(1)}>
                                        <ArrowLeft className='w-3.5 h-3.5 mr-1.5' /> Ganti paket
                                    </Button>
                                    <Button size='sm' disabled={outputs.length === 0} onClick={() => setStep(3)} className='flex-1'>
                                        Lanjut ke foto <ArrowRight className='w-3.5 h-3.5 ml-1.5' />
                                    </Button>
                                </div>
                                {!canToFoto && outputs.length > 0 && (
                                    <p className='text-xs text-amber-600 dark:text-amber-400'>Komponen non-komunal butuh penerima — tambah dulu atau foto menyusul setelah penerima ada.</p>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Langkah 3: foto */}
                {step === 3 && (
                    <div className='space-y-3'>
                        <label className='flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer bg-muted/30 hover:bg-muted/50'>
                            {previewUrl ? (
                                <img src={previewUrl} alt='Pratinjau' className='h-full w-full object-contain rounded-xl' />
                            ) : (
                                <span className='text-sm text-muted-foreground'>Ketuk untuk pilih foto (JPG/PNG, maks 50MB)</span>
                            )}
                            <input
                                type='file'
                                accept='image/*'
                                capture='environment'
                                className='hidden'
                                onChange={(e) => {
                                    const f = e.target.files?.[0]
                                    if (f) void handleFile(f)
                                    e.target.value = ''
                                }}
                            />
                        </label>

                        <div className='grid grid-cols-2 gap-3'>
                            <div className='space-y-1.5'>
                                <Label>Komponen{outputs.length > 1 ? '' : ' (otomatis)'}</Label>
                                <SearchableSelect
                                    options={outputs.map((o) => ({
                                        value: o.id.toString(),
                                        label: `${o.komponen} (${o.volume} ${o.satuan})`,
                                    }))}
                                    value={komponenId}
                                    onValueChange={setKomponenId}
                                    placeholder='Pilih komponen'
                                    searchPlaceholder='Cari komponen...'
                                    emptyMessage='Komponen tidak ditemukan.'
                                    disabled={outputs.length <= 1}
                                />
                            </div>
                            <div className='space-y-1.5'>
                                <Label>Progress</Label>
                                <Select value={keterangan} onValueChange={setKeterangan}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {PROGRESS_OPTIONS.map((o) => (
                                            <SelectItem key={o} value={o}>{o}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {needPenerima && (
                            <div className='space-y-1.5'>
                                <Label>Penerima{penerimas.length > 1 ? '' : ' (otomatis)'}</Label>
                                <SearchableSelect
                                    options={penerimas.map((p) => ({
                                        value: p.id.toString(),
                                        label: `${p.nama}${p.is_komunal ? ' (Komunal)' : ''}`,
                                    }))}
                                    value={penerimaId}
                                    onValueChange={setPenerimaId}
                                    placeholder='Pilih penerima'
                                    searchPlaceholder='Cari penerima...'
                                    emptyMessage='Penerima tidak ditemukan.'
                                    disabled={penerimas.length <= 1}
                                />
                            </div>
                        )}
                        {unitCount > 1 && (
                            <div className='space-y-1.5'>
                                <Label>Nomor Unit</Label>
                                <Select value={unitIndex || undefined} onValueChange={setUnitIndex}>
                                    <SelectTrigger><SelectValue placeholder='Pilih unit' /></SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: unitCount }).map((_, i) => (
                                            <SelectItem key={i + 1} value={String(i + 1)}>Unit {i + 1}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className='space-y-1.5'>
                            <Label>Koordinat</Label>
                            <div className='flex gap-2'>
                                <Input
                                    value={koordinat}
                                    onChange={(e) => setKoordinat(e.target.value)}
                                    placeholder='-6.xxxxx, 107.xxxxx'
                                />
                                <Button type='button' variant='outline' onClick={handleGps}>
                                    <MapPin className='w-4 h-4' />
                                </Button>
                            </div>
                            {geoValidation && !geoValidation.loading && (
                                <p className={`text-xs ${geoValidation.isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                    {geoValidation.message}
                                </p>
                            )}
                        </div>

                        <div className='flex gap-2'>
                            <Button variant='ghost' size='sm' onClick={() => setStep(2)}>
                                <ArrowLeft className='w-3.5 h-3.5 mr-1.5' /> Kembali
                            </Button>
                            <Button className='flex-1' disabled={saving} onClick={handleSubmit}>
                                {saving ? <Loader2 className='w-4 h-4 animate-spin mr-2' /> : <Camera className='w-4 h-4 mr-2' />}
                                {saving ? 'Mengirim...' : 'Kirim Foto'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
