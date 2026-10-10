import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
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
import { Textarea } from '@/components/ui/textarea'
import { ApiError } from '@/lib/api-client'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { useCreateJurnal, useUpdateJurnal } from '../hooks/useJurnalKegiatan'
import {
    emptyJurnalFormValues,
    firstErrorPerField,
    RHK_MAX,
    RHK_MIN,
    toIsoDate,
    toJurnalFormValues,
    toJurnalPayload,
} from '../lib/jurnal-helpers'
import type { JurnalEntry, JurnalField, JurnalFormValues } from '../types'

interface JurnalFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    /** null berarti mode tambah. */
    entry: JurnalEntry | null
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null
    return <p className="mt-1 text-xs font-medium text-destructive">{message}</p>
}

export default function JurnalFormDialog({ open, onOpenChange, entry }: JurnalFormDialogProps) {
    const isEdit = entry !== null
    const form = useForm<JurnalFormValues>({
        defaultValues: emptyJurnalFormValues(toIsoDate(new Date())),
    })
    const createMutation = useCreateJurnal()
    const updateMutation = useUpdateJurnal()
    const isPending = createMutation.isPending || updateMutation.isPending

    useEffect(() => {
        if (open) {
            form.reset(entry ? toJurnalFormValues(entry) : emptyJurnalFormValues(toIsoDate(new Date())))
        }
    }, [open, entry, form])

    const errors = form.formState.errors

    const onSubmit = async (values: JurnalFormValues) => {
        const payload = toJurnalPayload(values)
        try {
            if (entry) {
                await updateMutation.mutateAsync({ id: entry.id, payload })
            } else {
                await createMutation.mutateAsync(payload)
            }
            onOpenChange(false)
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
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Ubah Kegiatan' : 'Tambah Kegiatan'}</DialogTitle>
                    <DialogDescription>
                        Catat kegiatan harian beserta RHK dan output yang dihasilkan.
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
                            <Input
                                id="jurnal-rhk"
                                type="number"
                                inputMode="numeric"
                                min={RHK_MIN}
                                max={RHK_MAX}
                                step={1}
                                placeholder={`${RHK_MIN}-${RHK_MAX}`}
                                aria-invalid={!!errors.rhk}
                                {...form.register('rhk', {
                                    validate: (value) => {
                                        if (value.trim() === '') return true
                                        const n = Number(value)
                                        return (Number.isInteger(n) && n >= RHK_MIN && n <= RHK_MAX)
                                            || `RHK harus bilangan bulat ${RHK_MIN}-${RHK_MAX}`
                                    },
                                })}
                            />
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

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
