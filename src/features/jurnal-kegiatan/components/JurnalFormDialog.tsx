import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ApiError } from '@/lib/api-client'
import { getApiErrorMessage } from '@/lib/api-error-message'
import {
    useCreateJurnal,
    useDeleteJurnalFoto,
    useJurnalRhk,
    useUpdateJurnal,
    useUploadJurnalFoto,
} from '../hooks/useJurnalKegiatan'
import { rhkOptionLabel } from '../lib/rhk-helpers'
import {
    emptyJurnalFormValues,
    FOTO_ACCEPT_ATTR,
    FOTO_MAX_BYTES,
    FOTO_MAX_COUNT,
    firstErrorPerField,
    formatBytesMb,
    fotoErrorMessage,
    fotoThumbSrc,
    toIsoDate,
    toJurnalFormValues,
    toJurnalPayload,
    validateFotoSelection,
} from '../lib/jurnal-helpers'
import type { JurnalEntry, JurnalField, JurnalFormValues } from '../types'

interface JurnalFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    /** null berarti mode tambah. */
    entry: JurnalEntry | null
    /** Membuka dialog pengaturan RHK dari halaman. */
    onOpenRhkSettings: () => void
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null
    return <p className="mt-1 text-xs font-medium text-destructive">{message}</p>
}

export default function JurnalFormDialog({ open, onOpenChange, entry, onOpenRhkSettings }: JurnalFormDialogProps) {
    // Entri tersimpan. Diisi dari prop saat dibuka, lalu diperbarui setelah POST, PUT, atau perubahan foto.
    const [current, setCurrent] = useState<JurnalEntry | null>(entry)
    const [pendingFiles, setPendingFiles] = useState<File[]>([])
    const [fotoNotices, setFotoNotices] = useState<string[]>([])
    const [fotoError, setFotoError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const isEdit = current !== null
    const form = useForm<JurnalFormValues>({
        defaultValues: emptyJurnalFormValues(toIsoDate(new Date())),
    })
    const createMutation = useCreateJurnal()
    const updateMutation = useUpdateJurnal()
    const uploadMutation = useUploadJurnalFoto()
    const deleteFotoMutation = useDeleteJurnalFoto()
    const isBusy = createMutation.isPending || updateMutation.isPending
        || uploadMutation.isPending || deleteFotoMutation.isPending

    useEffect(() => {
        if (open) {
            form.reset(entry ? toJurnalFormValues(entry) : emptyJurnalFormValues(toIsoDate(new Date())))
            setCurrent(entry)
            setPendingFiles([])
            setFotoNotices([])
            setFotoError(null)
        }
    }, [open, entry, form])

    const errors = form.formState.errors
    const tanggalValue = form.watch('tanggal')
    const tahunTanggal = Number(tanggalValue?.slice(0, 4)) || new Date().getFullYear()
    const rhkQuery = useJurnalRhk(tahunTanggal, open)
    const rhkList = rhkQuery.data ?? []
    const existingCount = current?.foto.length ?? 0
    const totalFoto = existingCount + pendingFiles.length

    const handlePickFiles = (event: ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(event.target.files ?? [])
        const { accepted, messages } = validateFotoSelection(picked, totalFoto)
        setPendingFiles((prev) => [...prev, ...accepted])
        setFotoNotices(messages)
        setFotoError(null)
        event.target.value = ''
    }

    const removePending = (index: number) => {
        setPendingFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const handleDeleteExisting = async (mediaId: number) => {
        if (!current) return
        try {
            const res = await deleteFotoMutation.mutateAsync({ id: current.id, mediaId })
            setCurrent(res.data)
        } catch {
            // Pesan error sudah ditampilkan oleh hook.
        }
    }

    const handleFotoUploadError = (error: unknown) => {
        if (error instanceof ApiError && error.status === 422) {
            const data = error.data as { errors?: Record<string, string[] | string> } | undefined
            const message = fotoErrorMessage(data?.errors)
            if (message) {
                setFotoError(message)
                return
            }
        }
        // Kesalahan lain sudah ditampilkan oleh hook.
    }

    const onSubmit = async (values: JurnalFormValues) => {
        const payload = toJurnalPayload(values)

        let saved: JurnalEntry
        try {
            if (current) {
                const res = await updateMutation.mutateAsync({ id: current.id, payload })
                saved = res.data
            } else {
                const res = await createMutation.mutateAsync(payload)
                saved = res.data
            }
        } catch (error) {
            if (error instanceof ApiError && error.status === 422) {
                const data = error.data as { errors?: Record<string, string[]> } | undefined
                const fieldErrors = firstErrorPerField(data?.errors)
                const fields = Object.keys(fieldErrors) as JurnalField[]
                fields.forEach((field) => {
                    form.setError(field, { type: 'server', message: fieldErrors[field] })
                })
                if (fields.length === 0) {
                    toast.error(getApiErrorMessage(error, 'Data kegiatan tidak valid'))
                }
            }
            return
        }

        // Entri sudah tersimpan. Jika foto gagal, dialog tetap terbuka agar simpan ulang mengubah entri yang sama.
        setCurrent(saved)

        if (pendingFiles.length > 0) {
            try {
                const res = await uploadMutation.mutateAsync({ id: saved.id, files: pendingFiles })
                setCurrent(res.data)
                setPendingFiles([])
            } catch (error) {
                handleFotoUploadError(error)
                return
            }
        }

        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Ubah Kegiatan' : 'Tambah Kegiatan'}</DialogTitle>
                    <DialogDescription>
                        Catat kegiatan harian beserta RHK, output, dan foto bukti.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="jurnal-tanggal">Tanggal</Label>
                            <Input
                                id="jurnal-tanggal"
                                type="date"
                                aria-invalid={!!errors.tanggal}
                                {...form.register('tanggal', { required: 'Tanggal wajib diisi' })}
                            />
                            <FieldError message={errors.tanggal?.message} />
                        </div>
                        <div>
                            <Label htmlFor="jurnal-rhk">RHK (opsional)</Label>
                            <Controller
                                name="rhk"
                                control={form.control}
                                render={({ field }) => {
                                    const current = field.value
                                    const knownNos = new Set(rhkList.map((item) => String(item.no)))
                                    const orphan = current !== '' && !knownNos.has(current) ? current : null
                                    return (
                                        <Select
                                            value={current === '' ? 'none' : current}
                                            onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                                        >
                                            <SelectTrigger id="jurnal-rhk" className="w-full" aria-invalid={!!errors.rhk}>
                                                <SelectValue placeholder="Pilih RHK" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">–</SelectItem>
                                                {rhkList.map((item) => (
                                                    <SelectItem key={item.no} value={String(item.no)}>
                                                        {rhkOptionLabel(item)}
                                                    </SelectItem>
                                                ))}
                                                {orphan && <SelectItem value={orphan}>RHK {orphan}</SelectItem>}
                                            </SelectContent>
                                        </Select>
                                    )
                                }}
                            />
                            {!rhkQuery.isLoading && rhkList.length === 0 && (
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span>Atur RHK dulu untuk tahun {tahunTanggal}.</span>
                                    <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={onOpenRhkSettings}>
                                        Atur RHK
                                    </Button>
                                </div>
                            )}
                            <FieldError message={errors.rhk?.message} />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="jurnal-kegiatan">Kegiatan</Label>
                        <Textarea
                            id="jurnal-kegiatan"
                            rows={3}
                            placeholder="Uraian kegiatan yang dilakukan"
                            aria-invalid={!!errors.kegiatan}
                            {...form.register('kegiatan', {
                                validate: (value) => value.trim() !== '' || 'Kegiatan wajib diisi',
                                maxLength: { value: 1000, message: 'Kegiatan maksimal 1000 karakter' },
                            })}
                        />
                        <FieldError message={errors.kegiatan?.message} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="jurnal-output">Output (opsional)</Label>
                            <Input
                                id="jurnal-output"
                                type="number"
                                inputMode="decimal"
                                min={0}
                                step="any"
                                aria-invalid={!!errors.output}
                                {...form.register('output', {
                                    validate: (value) => {
                                        if (value.trim() === '') return true
                                        const n = Number(value)
                                        return (Number.isFinite(n) && n >= 0) || 'Output harus angka 0 atau lebih'
                                    },
                                })}
                            />
                            <FieldError message={errors.output?.message} />
                        </div>
                        <div>
                            <Label htmlFor="jurnal-satuan">Satuan (opsional)</Label>
                            <Input
                                id="jurnal-satuan"
                                placeholder="mis. dokumen, lembar"
                                aria-invalid={!!errors.satuan}
                                {...form.register('satuan', {
                                    maxLength: { value: 50, message: 'Satuan maksimal 50 karakter' },
                                })}
                            />
                            <FieldError message={errors.satuan?.message} />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="jurnal-keterangan">Keterangan (opsional)</Label>
                        <Textarea
                            id="jurnal-keterangan"
                            rows={2}
                            aria-invalid={!!errors.keterangan}
                            {...form.register('keterangan', {
                                maxLength: { value: 500, message: 'Keterangan maksimal 500 karakter' },
                            })}
                        />
                        <FieldError message={errors.keterangan?.message} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="jurnal-foto">Foto bukti (opsional)</Label>

                        {current && current.foto.length > 0 && (
                            <ul className="flex flex-wrap gap-2">
                                {current.foto.map((item) => (
                                    <li key={item.id} className="relative">
                                        <img
                                            src={fotoThumbSrc(item)}
                                            alt=""
                                            loading="lazy"
                                            className="h-16 w-16 rounded-md border object-cover"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                            onClick={() => handleDeleteExisting(item.id)}
                                            disabled={isBusy}
                                            aria-label="Hapus foto"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <Input
                            id="jurnal-foto"
                            ref={fileInputRef}
                            type="file"
                            accept={FOTO_ACCEPT_ATTR}
                            multiple
                            onChange={handlePickFiles}
                            disabled={isBusy || totalFoto >= FOTO_MAX_COUNT}
                            aria-invalid={!!fotoError}
                            className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground">
                            JPG atau PNG, maks. {formatBytesMb(FOTO_MAX_BYTES)} per berkas. Sisa {Math.max(0, FOTO_MAX_COUNT - totalFoto)} dari {FOTO_MAX_COUNT} foto.
                        </p>

                        {pendingFiles.length > 0 && (
                            <ul className="space-y-1 text-sm">
                                {pendingFiles.map((file, index) => (
                                    <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-2">
                                        <span className="truncate">{file.name}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 shrink-0"
                                            onClick={() => removePending(index)}
                                            disabled={isBusy}
                                            aria-label={`Batalkan ${file.name}`}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {fotoNotices.map((message) => (
                            <FieldError key={message} message={message} />
                        ))}
                        <FieldError message={fotoError ?? undefined} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isBusy}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={isBusy}>
                            {isBusy ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
