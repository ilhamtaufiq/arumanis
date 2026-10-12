import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Textarea } from '@/components/ui/textarea'
import { getDocumentTypes, getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { useCreateSurat, useSuratPratinjau, useUpdateSurat } from '../hooks/useSurat'
import type { Surat, SuratFormData } from '../types'

interface SuratFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    /** `null` untuk surat baru. */
    surat: Surat | null
    defaultTahun: number
}

const hariIni = () => new Date().toISOString().slice(0, 10)

function formAwal(surat: Surat | null, defaultTahun: number) {
    if (surat) {
        return {
            typeId: String(surat.type_id),
            tanggal: surat.tanggal,
            perihal: surat.perihal,
            tujuan: surat.tujuan ?? '',
            keterangan: surat.keterangan ?? '',
            pekerjaanId: surat.pekerjaan_id ? String(surat.pekerjaan_id) : '',
            nomor: surat.nomor,
        }
    }
    const tanggal = defaultTahun === new Date().getFullYear() ? hariIni() : `${defaultTahun}-01-01`
    return { typeId: '', tanggal, perihal: '', tujuan: '', keterangan: '', pekerjaanId: '', nomor: '' }
}

export function SuratFormDialog({ open, onOpenChange, surat, defaultTahun }: SuratFormDialogProps) {
    const isEdit = surat !== null
    const [form, setForm] = useState(() => formAwal(surat, defaultTahun))
    const createMutation = useCreateSurat()
    const updateMutation = useUpdateSurat()
    const busy = createMutation.isPending || updateMutation.isPending

    // Isi ulang setiap kali dialog dibuka untuk data yang berbeda.
    useEffect(() => {
        if (open) setForm(formAwal(surat, defaultTahun))
    }, [open, surat, defaultTahun])

    const { data: jenisList = [] } = useQuery({
        queryKey: ['document-types'],
        queryFn: async () => (await getDocumentTypes()).data,
        enabled: open,
        staleTime: 5 * 60_000,
    })

    const { data: pekerjaanList = [] } = useQuery({
        queryKey: ['pekerjaan', { per_page: 200, summary: true }],
        queryFn: async () => (await getPekerjaan({ per_page: 200, summary: true })).data,
        enabled: open,
        staleTime: 5 * 60_000,
    })

    // Tahun surat ikut tanggal. Saat ubah, tahun dikunci ke tahun asal.
    const tahunTanggal = Number(form.tanggal.slice(0, 4))
    const tahunKunci = isEdit ? surat.tahun : null
    const pratinjauParams = useMemo(
        () =>
            !isEdit && form.typeId && /^\d{4}-\d{2}-\d{2}$/.test(form.tanggal)
                ? { tahun: tahunTanggal, type_id: Number(form.typeId), tanggal: form.tanggal }
                : null,
        [isEdit, form.typeId, form.tanggal, tahunTanggal],
    )
    const { data: pratinjau, isFetching: pratinjauMemuat } = useSuratPratinjau(open ? pratinjauParams : null)

    const set = (kunci: keyof typeof form) => (nilai: string) => setForm((f) => ({ ...f, [kunci]: nilai }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.typeId) return toast.error('Pilih jenis surat')
        if (!form.tanggal) return toast.error('Isi tanggal surat')
        if (!form.perihal.trim()) return toast.error('Isi perihal surat')

        const data: SuratFormData = {
            type_id: Number(form.typeId),
            tanggal: form.tanggal,
            perihal: form.perihal.trim(),
            tujuan: form.tujuan.trim() || null,
            keterangan: form.keterangan.trim() || null,
            pekerjaan_id: form.pekerjaanId ? Number(form.pekerjaanId) : null,
        }
        const nomor = form.nomor.trim()
        if (nomor) data.nomor = nomor

        try {
            if (surat) {
                await updateMutation.mutateAsync({ id: surat.id, data })
                toast.success('Surat diperbarui')
            } else {
                const hasil = await createMutation.mutateAsync(data)
                toast.success(`Surat ${hasil.data.data.nomor} dibuat`)
            }
            onOpenChange(false)
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Gagal menyimpan surat'))
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{isEdit ? `Ubah surat ${surat.nomor}` : 'Surat baru'}</DialogTitle>
                    <DialogDescription>
                        Nomor surat terpusat untuk semua surat. Surat boleh dikaitkan dengan pekerjaan, boleh juga tidak.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Jenis surat <span className="text-red-500">*</span></Label>
                        <SearchableSelect
                            options={jenisList.map((j) => ({ value: String(j.id), label: `${j.name} (${j.code})` }))}
                            value={form.typeId}
                            onValueChange={set('typeId')}
                            placeholder="Pilih jenis surat"
                            searchPlaceholder="Cari jenis surat..."
                            emptyMessage="Jenis surat tidak ditemukan."
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="surat-tanggal">Tanggal <span className="text-red-500">*</span></Label>
                            <Input
                                id="surat-tanggal"
                                type="date"
                                value={form.tanggal}
                                min={tahunKunci ? `${tahunKunci}-01-01` : undefined}
                                max={tahunKunci ? `${tahunKunci}-12-31` : undefined}
                                onChange={(e) => set('tanggal')(e.target.value)}
                            />
                            {tahunKunci && (
                                <p className="text-xs text-muted-foreground">
                                    Tahun dikunci ke {tahunKunci}, sesuai deret nomor surat ini.
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="surat-nomor">Nomor</Label>
                            <Input
                                id="surat-nomor"
                                value={form.nomor}
                                placeholder={isEdit ? '' : 'Kosong = otomatis'}
                                onChange={(e) => set('nomor')(e.target.value)}
                            />
                            {!isEdit && (
                                <p className="text-xs text-muted-foreground">
                                    {!form.typeId || !form.tanggal
                                        ? 'Pilih jenis dan tanggal untuk melihat nomor.'
                                        : form.nomor.trim()
                                          ? 'Nomor diisi manual.'
                                          : pratinjauMemuat
                                            ? 'Menghitung nomor…'
                                            : pratinjau
                                              ? `Nomor otomatis: ${pratinjau.nomor}`
                                              : 'Nomor belum bisa dihitung.'}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="surat-perihal">Perihal <span className="text-red-500">*</span></Label>
                        <Input id="surat-perihal" value={form.perihal} maxLength={500} onChange={(e) => set('perihal')(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="surat-tujuan">Tujuan</Label>
                        <Input id="surat-tujuan" value={form.tujuan} maxLength={255} onChange={(e) => set('tujuan')(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label>Terkait pekerjaan</Label>
                        <SearchableSelect
                            options={[
                                { value: '', label: 'Tidak terkait pekerjaan' },
                                ...pekerjaanList.map((p) => ({ value: String(p.id), label: p.nama_paket })),
                            ]}
                            value={form.pekerjaanId}
                            onValueChange={set('pekerjaanId')}
                            placeholder="Tidak terkait pekerjaan"
                            searchPlaceholder="Cari pekerjaan..."
                            emptyMessage="Pekerjaan tidak ditemukan."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="surat-keterangan">Keterangan</Label>
                        <Textarea id="surat-keterangan" rows={3} value={form.keterangan} onChange={(e) => set('keterangan')(e.target.value)} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={busy}>
                            {busy ? 'Menyimpan…' : isEdit ? 'Simpan perubahan' : 'Buat surat'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
