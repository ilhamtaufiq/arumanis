import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Camera, Loader2, MapPin, X } from 'lucide-react'
import { toast } from 'sonner'
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
import { getOutput } from '@/features/output/api/output'
import { getPenerimaList } from '@/features/penerima/api'
import type { Output } from '@/features/output/types'
import type { Penerima } from '@/features/penerima/types'

const PROGRESS_OPTIONS = ['0%', '25%', '50%', '75%', '100%'] as const

interface ChatFotoUploadProps {
    open: boolean
    onClose: () => void
    /** Nama paket dari konteks chat terakhir (opsional, untuk prefill). */
    paketName?: string | null
    paketId?: number | null
}

/**
 * Dialog upload foto dari chat. Upload langsung ke POST /foto
 * (file biner tak bisa lewat LLM) — koordinat dari EXIF/GPS.
 * ponytail: gabung ke EmbeddedFotoForm bila duplikasi melebar.
 */
export default function ChatFotoUpload({ open, onClose, paketName, paketId }: ChatFotoUploadProps) {
    const queryClient = useQueryClient()
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [pekerjaanId, setPekerjaanId] = useState<string>(paketId ? String(paketId) : '')
    const [outputs, setOutputs] = useState<Output[]>([])
    const [penerimas, setPenerimas] = useState<Penerima[]>([])
    const [komponenId, setKomponenId] = useState('')
    const [penerimaId, setPenerimaId] = useState('')
    const [keterangan, setKeterangan] = useState<string>('0%')
    const [koordinat, setKoordinat] = useState('')
    const [unitIndex, setUnitIndex] = useState('')
    const [loadingMeta, setLoadingMeta] = useState(false)
    const [saving, setSaving] = useState(false)

    const pid = Number(pekerjaanId) || 0
    const geoValidation = useKoordinatValidation(pid > 0 ? pid : undefined, koordinat)

    useEffect(() => {
        if (paketId) setPekerjaanId(String(paketId))
    }, [paketId, open])

    // Muat output + penerima saat ID paket valid.
    useEffect(() => {
        if (!open || pid <= 0) {
            setOutputs([])
            setPenerimas([])
            return
        }
        setLoadingMeta(true)
        Promise.all([
            getOutput({ pekerjaan_id: pid, per_page: -1 }).catch(() => null),
            getPenerimaList({ pekerjaan_id: pid, per_page: -1 }).catch(() => null),
        ]).then(([o, p]) => {
            setOutputs(o?.data ?? [])
            setPenerimas(p?.data ?? [])
            setKomponenId('')
            setPenerimaId('')
        }).finally(() => setLoadingMeta(false))
    }, [open, pid])

    if (!open) return null

    const selectedOutput = outputs.find((o) => o.id.toString() === komponenId)
    const showPenerima = selectedOutput && !selectedOutput.penerima_is_optional
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

    const handleSubmit = async () => {
        if (pid <= 0) return toast.error('Isi ID paket dulu')
        if (!komponenId) return toast.error('Pilih komponen')
        if (showPenerima && !penerimaId) return toast.error('Pilih penerima manfaat')
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
                    </h3>
                    <button type='button' onClick={onClose} className='rounded-full p-1.5 hover:bg-muted' title='Tutup'>
                        <X className='w-4 h-4' />
                    </button>
                </div>

                {paketName && (
                    <p className='text-[12px] text-muted-foreground'>
                        Konteks: <span className='font-medium text-foreground'>{paketName}</span>
                    </p>
                )}

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
                        <Label>ID Paket</Label>
                        <Input
                            inputMode='numeric'
                            value={pekerjaanId}
                            onChange={(e) => setPekerjaanId(e.target.value.replace(/\D/g, ''))}
                            placeholder='cth: 648'
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

                {loadingMeta ? (
                    <p className='text-[13px] text-muted-foreground flex items-center gap-2'>
                        <Loader2 className='w-4 h-4 animate-spin' /> Memuat komponen...
                    </p>
                ) : (
                    <>
                        <div className='space-y-1.5'>
                            <Label>Komponen</Label>
                            <SearchableSelect
                                options={outputs.map((o) => ({
                                    value: o.id.toString(),
                                    label: `${o.komponen} (${o.volume} ${o.satuan})`,
                                }))}
                                value={komponenId}
                                onValueChange={setKomponenId}
                                placeholder={outputs.length === 0 ? 'Isi ID paket dulu' : 'Pilih komponen'}
                                searchPlaceholder='Cari komponen...'
                                emptyMessage='Komponen tidak ditemukan.'
                                disabled={outputs.length === 0}
                            />
                        </div>
                        {showPenerima && (
                            <div className='space-y-1.5'>
                                <Label>Penerima</Label>
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
                                    disabled={penerimas.length === 0}
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
                    </>
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
                        <p className={`text-xs ${geoValidation.isValid ? 'text-green-600' : 'text-amber-600'}`}>
                            {geoValidation.message}
                        </p>
                    )}
                </div>

                <Button className='w-full' disabled={saving} onClick={handleSubmit}>
                    {saving ? <Loader2 className='w-4 h-4 animate-spin mr-2' /> : <Camera className='w-4 h-4 mr-2' />}
                    {saving ? 'Mengirim...' : 'Kirim Foto'}
                </Button>
            </div>
        </div>
    )
}
