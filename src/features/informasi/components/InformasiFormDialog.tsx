import { useEffect, useState } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { useCreateInformasi, useUpdateInformasi } from '../hooks/useInformasi'
import { emptyInformasiForm, KATEGORI_OPSI, toInformasiForm, validasiInformasiForm } from '../lib/informasi-helpers'
import type { Informasi, InformasiFormData, InformasiKategori } from '../types'

interface InformasiFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    /** null berarti tambah. */
    item: Informasi | null
}

type FieldErrors = Partial<Record<'judul' | 'isi' | 'tampil_sampai', string>>

export function InformasiFormDialog({ open, onOpenChange, item }: InformasiFormDialogProps) {
    const [form, setForm] = useState<InformasiFormData>(emptyInformasiForm)
    const [errors, setErrors] = useState<FieldErrors>({})
    const createMutation = useCreateInformasi()
    const updateMutation = useUpdateInformasi()
    const isPending = createMutation.isPending || updateMutation.isPending

    useEffect(() => {
        if (open) {
            setForm(item ? toInformasiForm(item) : emptyInformasiForm())
            setErrors({})
        }
    }, [open, item])

    const set = <K extends keyof InformasiFormData>(key: K, value: InformasiFormData[K]) =>
        setForm((prev) => ({ ...prev, [key]: value }))

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        const clientErrors = validasiInformasiForm(form)
        setErrors(clientErrors)
        if (Object.keys(clientErrors).length > 0) return

        const payload: InformasiFormData = {
            ...form,
            judul: form.judul.trim(),
            isi: form.isi.trim(),
            tampil_dari: form.tampil_dari || null,
            tampil_sampai: form.tampil_sampai || null,
        }
        try {
            if (item) {
                await updateMutation.mutateAsync({ id: item.id, data: payload })
                toast.success('Informasi diperbarui')
            } else {
                await createMutation.mutateAsync(payload)
                toast.success('Informasi ditambahkan')
            }
            onOpenChange(false)
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Gagal menyimpan informasi'))
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{item ? 'Ubah Informasi' : 'Informasi Baru'}</DialogTitle>
                    <DialogDescription>
                        Ditampilkan kepada semua pengguna. Atur tanggal tampil bila hanya berlaku pada periode tertentu.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <div>
                        <Label htmlFor="informasi-judul">Judul</Label>
                        <Input
                            id="informasi-judul"
                            value={form.judul}
                            onChange={(e) => set('judul', e.target.value)}
                            aria-invalid={!!errors.judul}
                            maxLength={255}
                        />
                        {errors.judul && <p className="mt-1 text-xs font-medium text-destructive">{errors.judul}</p>}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="informasi-kategori">Kategori</Label>
                            <Select value={form.kategori} onValueChange={(v) => set('kategori', v as InformasiKategori)}>
                                <SelectTrigger id="informasi-kategori" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {KATEGORI_OPSI.map((k) => (
                                        <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end justify-between gap-3 rounded-md border p-3">
                            <Label htmlFor="informasi-terbit" className="cursor-pointer">
                                Terbitkan
                                <span className="block text-xs font-normal text-muted-foreground">Nonaktif = draft</span>
                            </Label>
                            <Switch id="informasi-terbit" checked={form.terbit} onCheckedChange={(v) => set('terbit', v)} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="informasi-dari">Tampil mulai (opsional)</Label>
                            <Input
                                id="informasi-dari"
                                type="date"
                                value={form.tampil_dari ?? ''}
                                onChange={(e) => set('tampil_dari', e.target.value || null)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="informasi-sampai">Tampil sampai (opsional)</Label>
                            <Input
                                id="informasi-sampai"
                                type="date"
                                value={form.tampil_sampai ?? ''}
                                onChange={(e) => set('tampil_sampai', e.target.value || null)}
                                aria-invalid={!!errors.tampil_sampai}
                            />
                            {errors.tampil_sampai && (
                                <p className="mt-1 text-xs font-medium text-destructive">{errors.tampil_sampai}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="informasi-isi">Isi</Label>
                        <Textarea
                            id="informasi-isi"
                            rows={8}
                            value={form.isi}
                            onChange={(e) => set('isi', e.target.value)}
                            aria-invalid={!!errors.isi}
                            placeholder="Tulis informasi. Baris baru akan ditampilkan apa adanya."
                        />
                        {errors.isi && <p className="mt-1 text-xs font-medium text-destructive">{errors.isi}</p>}
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
