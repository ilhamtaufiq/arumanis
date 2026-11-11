import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getDocumentTypes } from '@/features/pekerjaan/api/pekerjaan'
import { createSurat } from '@/features/surat/api'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { jenisUntuk, perihalNomor, type KodeNomorKontrak } from '../lib/nomor-surat'

type Props = {
    id: string
    label: string
    name: string
    kode: KodeNomorKontrak
    value: string
    onChange: (nomor: string) => void
    /** Tanggal dokumen (YYYY-MM-DD) dari kolom tanggal di sebelahnya. Nomor dibuat pada tanggal ini. */
    tanggal: string
    namaPenyedia?: string | null
    pekerjaanId: number | null
    placeholder: string
}

/**
 * Kolom nomor dokumen kontrak dengan tombol "Buat nomor". Nomor diambil dari Penomoran Surat,
 * sehingga tidak perlu berpindah halaman. Tombol hilang setelah kolom terisi, supaya tidak ada nomor ganda.
 */
export function NomorDokumenInput({ id, label, name, kode, value, onChange, tanggal, namaPenyedia, pekerjaanId, placeholder }: Props) {
    const qc = useQueryClient()
    const jenisQuery = useQuery({ queryKey: ['document-types'], queryFn: getDocumentTypes, staleTime: 5 * 60_000 })
    const pilihan = useMemo(() => jenisUntuk(jenisQuery.data ?? [], kode), [jenisQuery.data, kode])
    const [jenisId, setJenisId] = useState<string>('')
    // Hanya satu pilihan yang cocok: langsung dipakai. Lebih dari satu: pengguna memilih sendiri.
    const terpilihId = pilihan.some((j) => String(j.id) === jenisId)
        ? jenisId
        : pilihan.length === 1 ? String(pilihan[0].id) : ''
    const jenis = pilihan.find((j) => String(j.id) === terpilihId)

    const buat = useMutation({
        mutationFn: () => {
            if (!jenis) throw new Error(`Pilih jenis surat ${kode} dulu.`)
            return createSurat({
                type_id: jenis.id,
                tanggal,
                perihal: perihalNomor(kode, namaPenyedia),
                tujuan: namaPenyedia?.trim() || null,
                pekerjaan_id: pekerjaanId,
            })
        },
        onSuccess: (res) => {
            onChange(res.data.nomor)
            void qc.invalidateQueries({ queryKey: ['surat'] })
            toast.success(`Nomor ${kode} dibuat: ${res.data.nomor}`)
        },
        onError: (err) => toast.error(getApiErrorMessage(err, `Gagal membuat nomor ${kode}`)),
    })

    const tanpaJenis = !jenisQuery.isPending && pilihan.length === 0
    const tanpaTanggal = tanggal.trim() === ''
    const bisaBuat = !value && !!jenis && !tanpaTanggal && !buat.isPending
    const keterangan = tanpaJenis
        ? `Belum ada jenis surat ${kode} atau ${kode}-* di Penomoran Surat.`
        : !jenis
            ? 'Pilih jenis surat dulu.'
            : tanpaTanggal
                ? 'Isi tanggal dulu untuk membuat nomor.'
                : null

    return (
        <div className="space-y-2">
            <Label htmlFor={id} className="text-[10px] font-bold uppercase text-muted-foreground">{label}</Label>
            {!value && pilihan.length > 1 && (
                <select
                    aria-label={`Jenis surat ${label}`}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={terpilihId}
                    onChange={(e) => setJenisId(e.target.value)}
                >
                    <option value="">Pilih jenis surat…</option>
                    {pilihan.map((j) => (
                        <option key={j.id} value={String(j.id)}>
                            {j.code}
                            {j.name ? ` — ${j.name}` : ''}
                        </option>
                    ))}
                </select>
            )}
            <div className="flex gap-2">
                <Input id={id} name={name} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="flex-1" />
                {!value && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        disabled={!bisaBuat}
                        onClick={() => buat.mutate()}
                        title={keterangan ?? `Ambil nomor ${kode} berikutnya dari Penomoran Surat`}
                    >
                        {buat.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Wand2 className="mr-1.5 h-4 w-4" />}
                        Buat nomor
                    </Button>
                )}
            </div>
            {!value && keterangan && <p className="text-xs text-muted-foreground">{keterangan}</p>}
        </div>
    )
}
