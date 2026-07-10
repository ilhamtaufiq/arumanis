import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { CheckCircle2, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { getPublicKelembagaanForm, submitPublicKelembagaanForm } from '../api'
import type { KelembagaanFormFields } from '../types/share'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '@/lib/api-client'

const FIELD_GROUPS: {
    title: string
    fields: { key: keyof KelembagaanFormFields; label: string; placeholder?: string }[]
}[] = [
    {
        title: 'Identitas & pembangunan',
        fields: [
            { key: 'name', label: 'Nama unit SPAM', placeholder: 'SPAM / KPSPAM ...' },
            { key: 'tahun_pembangunan', label: 'Tahun pembangunan', placeholder: '2020 atau 2020, 2024' },
            { key: 'sumber_dana', label: 'Sumber dana', placeholder: 'APBD / DAK / APBN' },
            { key: 'program', label: 'Program pembangunan', placeholder: 'PAMSIMAS / DISTARKIM' },
        ],
    },
    {
        title: 'Data teknis',
        fields: [
            { key: 'sistem_layanan', label: 'Gravitasi / Pompa', placeholder: 'Gravitasi' },
            { key: 'sumber_mata_air_kap', label: 'Kap. mata air (L/det)', placeholder: '2.5' },
            { key: 'sumber_air_tanah_kap', label: 'Kap. air tanah (L/det)' },
            { key: 'lain_lain_kap', label: 'Lain-lain (L/det)' },
        ],
    },
    {
        title: 'Pengelola POKMAS',
        fields: [
            { key: 'pokmas', label: 'Nama POKMAS / KSM', placeholder: 'KSM Tirta Mandiri' },
            { key: 'perdes', label: 'Perdes pembentukan' },
            { key: 'kepala', label: 'Kepala / Ketua' },
            { key: 'bendahara', label: 'Bendahara' },
            { key: 'sekretaris', label: 'Sekretaris' },
        ],
    },
    {
        title: 'Parameter iuran',
        fields: [
            { key: 'tarif_dasar_hukum', label: 'Dasar hukum tarif' },
            { key: 'iuran_nominal', label: 'Besarnya iuran', placeholder: 'Rp 5.000 / KK / bulan' },
            { key: 'pendapatan_bulan', label: 'Pendapatan rata-rata/bulan (Rp)' },
            { key: 'biaya_operasional', label: 'Biaya operasional/bulan (Rp)' },
        ],
    },
]

interface SpamKelembagaanPublicFormProps {
    token: string
}

export function SpamKelembagaanPublicForm({ token }: SpamKelembagaanPublicFormProps) {
    const [form, setForm] = useState<KelembagaanFormFields>({})
    const [seeded, setSeeded] = useState(false)
    const [submitterName, setSubmitterName] = useState('')
    const [submitterPhone, setSubmitterPhone] = useState('')
    const [submitterInstansi, setSubmitterInstansi] = useState('')
    const [submitterNote, setSubmitterNote] = useState('')
    const [done, setDone] = useState(false)

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['public-kelembagaan-form', token],
        queryFn: () => getPublicKelembagaanForm(token),
        retry: false,
    })

    useEffect(() => {
        if (!seeded && data?.data?.unit?.current) {
            setForm({ ...data.data.unit.current })
            setSeeded(true)
        }
    }, [data, seeded])

    const mutation = useMutation({
        mutationFn: () =>
            submitPublicKelembagaanForm(token, {
                payload: form,
                submitter_name: submitterName.trim(),
                submitter_phone: submitterPhone.trim() || undefined,
                submitter_instansi: submitterInstansi.trim() || undefined,
                submitter_note: submitterNote.trim() || undefined,
            }),
        onSuccess: () => {
            setDone(true)
            toast.success('Usulan terkirim — menunggu verifikasi admin')
        },
        onError: (err) => {
            const msg =
                err instanceof ApiError
                    ? err.message
                    : 'Gagal mengirim usulan. Periksa isian atau coba lagi.'
            toast.error(msg)
        },
    })

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-muted-foreground">Memuat form kelembagaan...</p>
            </div>
        )
    }

    if (isError || !data?.data) {
        const msg =
            error instanceof ApiError
                ? error.message
                : 'Link form tidak valid atau sudah tidak aktif.'
        return (
            <Card className="mx-auto max-w-lg">
                <CardHeader>
                    <CardTitle>Form tidak tersedia</CardTitle>
                    <CardDescription>{msg}</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    const { unit, link } = data.data

    if (done) {
        return (
            <Card className="mx-auto max-w-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-emerald-700">
                        <CheckCircle2 className="h-5 w-5" />
                        Usulan terkirim
                    </CardTitle>
                    <CardDescription>
                        Terima kasih. Data Anda menunggu verifikasi admin dan belum langsung mengubah
                        master unit SPAM.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    Unit: {unit.name || `#${unit.id}`} · Desa {unit.desa} · {unit.kecamatan}
                </CardContent>
            </Card>
        )
    }

    const usable = link.is_usable

    return (
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
            <div>
                <h1 className="text-xl font-bold tracking-tight">Form Kelembagaan SPAM POKMAS</h1>
                <p className="text-sm text-muted-foreground">
                    {link.label || 'Pemutakhiran data kelembagaan'} — tanpa login. Perubahan diverifikasi
                    admin.
                </p>
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Unit SPAM</CardTitle>
                    <CardDescription>
                        {unit.kecamatan} · Desa {unit.desa}
                        {unit.name ? ` · ${unit.name}` : ''}
                    </CardDescription>
                </CardHeader>
            </Card>

            {!usable ? (
                <Card>
                    <CardContent className="py-6 text-sm text-rose-600">
                        Link ini sudah tidak aktif, kedaluwarsa, atau kuota usulan penuh. Hubungi admin
                        untuk link baru.
                    </CardContent>
                </Card>
            ) : (
                <form
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault()
                        if (!submitterName.trim()) {
                            toast.error('Nama pengirim wajib diisi')
                            return
                        }
                        mutation.mutate()
                    }}
                >
                    {FIELD_GROUPS.map((group) => (
                        <Card key={group.title}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">{group.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3 sm:grid-cols-2">
                                {group.fields.map((f) => (
                                    <div key={f.key} className="space-y-1">
                                        <Label htmlFor={f.key} className="text-xs">
                                            {f.label}
                                        </Label>
                                        <Input
                                            id={f.key}
                                            value={`${form[f.key] ?? ''}`}
                                            onChange={(e) =>
                                                setForm((prev) => ({ ...prev, [f.key]: e.target.value }))
                                            }
                                            placeholder={f.placeholder}
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Identitas pengirim</CardTitle>
                            <CardDescription>
                                Diperlukan untuk keperluan verifikasi admin.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1 sm:col-span-2">
                                <Label htmlFor="submitter_name" className="text-xs">
                                    Nama lengkap *
                                </Label>
                                <Input
                                    id="submitter_name"
                                    required
                                    value={submitterName}
                                    onChange={(e) => setSubmitterName(e.target.value)}
                                    placeholder="Nama Anda"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="submitter_phone" className="text-xs">
                                    No. HP / WA
                                </Label>
                                <Input
                                    id="submitter_phone"
                                    value={submitterPhone}
                                    onChange={(e) => setSubmitterPhone(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="submitter_instansi" className="text-xs">
                                    Instansi / jabatan
                                </Label>
                                <Input
                                    id="submitter_instansi"
                                    value={submitterInstansi}
                                    onChange={(e) => setSubmitterInstansi(e.target.value)}
                                    placeholder="Pengurus POKMAS / Kades"
                                />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                                <Label htmlFor="submitter_note" className="text-xs">
                                    Catatan
                                </Label>
                                <textarea
                                    id="submitter_note"
                                    rows={3}
                                    value={submitterNote}
                                    onChange={(e) => setSubmitterNote(e.target.value)}
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    placeholder="Keterangan tambahan (opsional)"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end pb-8">
                        <Button type="submit" disabled={mutation.isPending} className="min-w-[160px]">
                            {mutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="mr-2 h-4 w-4" />
                            )}
                            Kirim usulan
                        </Button>
                    </div>
                </form>
            )}
        </div>
    )
}
