import { useEffect, useRef, useState } from 'react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { ApiError } from '@/lib/api-client'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { useJurnalAtasan, useSaveJurnalAtasan } from '../hooks/useJurnalKegiatan'
import { ATASAN_FIELDS, atasanToForm, atasanToPayload, emptyAtasan } from '../lib/atasan-helpers'
import { firstErrorMessage } from '../lib/rhk-helpers'
import type { JurnalAtasan, JurnalAtasanField } from '../types'

interface PejabatPenilaiDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function PejabatPenilaiDialog({ open, onOpenChange }: PejabatPenilaiDialogProps) {
    const query = useJurnalAtasan(open)
    const saveMutation = useSaveJurnalAtasan()
    const [form, setForm] = useState<JurnalAtasan>(emptyAtasan())
    const [errors, setErrors] = useState<Partial<Record<JurnalAtasanField, string>>>({})
    const [formError, setFormError] = useState<string | null>(null)
    const initializedRef = useRef(false)

    // Isi form sekali dari server; refetch setelah simpan tidak menimpa ketikan.
    useEffect(() => {
        if (query.data && !initializedRef.current) {
            initializedRef.current = true
            setForm(atasanToForm(query.data))
        }
    }, [query.data])

    const handleChange = (key: JurnalAtasanField, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    const handleSave = async () => {
        setErrors({})
        setFormError(null)
        try {
            await saveMutation.mutateAsync(atasanToPayload(form))
            onOpenChange(false)
        } catch (error) {
            if (error instanceof ApiError && error.status === 422) {
                const data = error.data as { errors?: Record<string, string[] | string> } | undefined
                const fieldErrors: Partial<Record<JurnalAtasanField, string>> = {}
                for (const field of ATASAN_FIELDS) {
                    const message = firstErrorMessage(data?.errors, field.key)
                    if (message) fieldErrors[field.key] = message
                }
                setErrors(fieldErrors)
                if (Object.keys(fieldErrors).length === 0) {
                    setFormError(getApiErrorMessage(error, 'Data Pejabat Penilai tidak valid'))
                }
            }
        }
    }

    const busy = saveMutation.isPending
    const loading = query.isLoading && !query.data

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Pejabat Penilai Kinerja</DialogTitle>
                    <DialogDescription>
                        Data atasan yang menilai kinerja Anda. Semua kolom opsional.
                    </DialogDescription>
                </DialogHeader>

                <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                    Dipakai sebagai Pejabat Penilai di laporan SKP.
                </p>

                {query.isError && (
                    <div className="space-y-2 text-sm">
                        <p className="text-destructive">{getApiErrorMessage(query.error, 'Gagal memuat data')}</p>
                        <Button variant="outline" size="sm" onClick={() => query.refetch()}>
                            Coba lagi
                        </Button>
                    </div>
                )}

                {loading && <Skeleton className="h-64" />}

                {!loading && !query.isError && (
                    <form
                        className="space-y-4"
                        noValidate
                        onSubmit={(e) => {
                            e.preventDefault()
                            handleSave()
                        }}
                    >
                        {formError && (
                            <p role="alert" className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                                {formError}
                            </p>
                        )}

                        {ATASAN_FIELDS.map((field) => (
                            <div key={field.key} className="space-y-1">
                                <Label htmlFor={`atasan-${field.key}`}>{field.label}</Label>
                                <Input
                                    id={`atasan-${field.key}`}
                                    value={form[field.key]}
                                    placeholder={field.placeholder}
                                    maxLength={255}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                    aria-invalid={!!errors[field.key]}
                                    disabled={busy}
                                />
                                {errors[field.key] && (
                                    <p className="text-xs font-medium text-destructive">{errors[field.key]}</p>
                                )}
                            </div>
                        ))}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={busy}>
                                {busy ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
