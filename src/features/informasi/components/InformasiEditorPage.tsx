import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { LazyPublikasiEditor } from '@/features/publikasi/components/LazyPublikasiEditor'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { useCreateInformasi, useInformasiDetail, useUpdateInformasi } from '../hooks/useInformasi'
import { emptyInformasiForm, KATEGORI_OPSI, toInformasiForm, validasiInformasiForm } from '../lib/informasi-helpers'
import type { Informasi, InformasiFormData, InformasiKategori } from '../types'

type FieldErrors = Partial<Record<'judul' | 'isi' | 'tampil_sampai', string>>

interface InformasiEditorPageProps {
    /** null berarti tambah. */
    item: Informasi | null
}

export function InformasiEditorPage({ item }: InformasiEditorPageProps) {
    const navigate = useNavigate()
    const [form, setForm] = useState<InformasiFormData>(() => (item ? toInformasiForm(item) : emptyInformasiForm()))
    const [errors, setErrors] = useState<FieldErrors>({})
    const createMutation = useCreateInformasi()
    const updateMutation = useUpdateInformasi()
    const isPending = createMutation.isPending || updateMutation.isPending

    const set = <K extends keyof InformasiFormData>(key: K, value: InformasiFormData[K]) =>
        setForm((prev) => ({ ...prev, [key]: value }))

    const kembali = () => (item ? navigate({ to: '/informasi/$id', params: { id: String(item.id) } }) : navigate({ to: '/informasi' }))

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
            let id: number
            if (item) {
                await updateMutation.mutateAsync({ id: item.id, data: payload })
                id = item.id
            } else {
                id = (await createMutation.mutateAsync(payload)).data.id
            }
            toast.success(item ? 'Informasi diperbarui' : 'Informasi ditambahkan')
            navigate({ to: '/informasi/$id', params: { id: String(id) } })
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Gagal menyimpan informasi'))
        }
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={kembali}>
                    <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                    {item ? 'Batal' : 'Kembali ke daftar informasi'}
                </Button>
                <Button type="submit" disabled={isPending}>
                    <Save className="mr-2 h-4 w-4" />
                    {isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">{item ? 'Ubah Informasi' : 'Informasi Baru'}</h1>

            <div className="space-y-6">
                <div>
                    <Label htmlFor="informasi-judul">Judul</Label>
                    <Input
                        id="informasi-judul"
                        className="mt-1.5 h-12 text-lg font-semibold"
                        value={form.judul}
                        onChange={(e) => set('judul', e.target.value)}
                        aria-invalid={!!errors.judul}
                        maxLength={255}
                    />
                    {errors.judul && <p className="mt-1 text-xs font-medium text-destructive">{errors.judul}</p>}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                        <Label htmlFor="informasi-kategori">Kategori</Label>
                        <Select value={form.kategori} onValueChange={(v) => set('kategori', v as InformasiKategori)}>
                            <SelectTrigger id="informasi-kategori" className="mt-1.5 w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {KATEGORI_OPSI.map((k) => (
                                    <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="informasi-dari">Tampil mulai (opsional)</Label>
                        <Input
                            id="informasi-dari"
                            type="date"
                            className="mt-1.5"
                            value={form.tampil_dari ?? ''}
                            onChange={(e) => set('tampil_dari', e.target.value || null)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="informasi-sampai">Tampil sampai (opsional)</Label>
                        <Input
                            id="informasi-sampai"
                            type="date"
                            className="mt-1.5"
                            value={form.tampil_sampai ?? ''}
                            onChange={(e) => set('tampil_sampai', e.target.value || null)}
                            aria-invalid={!!errors.tampil_sampai}
                        />
                        {errors.tampil_sampai && (
                            <p className="mt-1 text-xs font-medium text-destructive">{errors.tampil_sampai}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                    <Label htmlFor="informasi-terbit" className="cursor-pointer">
                        Terbitkan
                        <span className="block text-xs font-normal text-muted-foreground">Nonaktif = draft, tidak tampil ke pengguna</span>
                    </Label>
                    <Switch id="informasi-terbit" checked={form.terbit} onCheckedChange={(v) => set('terbit', v)} />
                </div>

                <div className="space-y-1.5">
                    <Label>Isi</Label>
                    <div aria-invalid={!!errors.isi}>
                        <LazyPublikasiEditor content={form.isi} onChange={(html) => set('isi', html)} />
                    </div>
                    {errors.isi && <p className="mt-1 text-xs font-medium text-destructive">{errors.isi}</p>}
                </div>
            </div>
        </form>
    )
}

/** Halaman ubah: menunggu data lama dimuat sebelum editor dibuat, agar isinya langsung terisi. */
export function InformasiEditPage({ id }: { id: number }) {
    const { data, isLoading, isError } = useInformasiDetail(id)

    if (isLoading) return <p className="p-6 text-sm text-muted-foreground">Memuat informasi...</p>
    if (isError || !data) {
        return (
            <div className="mx-auto max-w-3xl p-6 text-sm text-muted-foreground">
                Informasi tidak ditemukan.{' '}
                <Link to="/informasi" className="font-medium text-primary underline-offset-4 hover:underline">Kembali ke daftar</Link>
            </div>
        )
    }
    return <InformasiEditorPage item={data.data} />
}
