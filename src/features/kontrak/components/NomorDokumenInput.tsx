import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getDocumentTypes } from '@/features/pekerjaan/api/pekerjaan'
import { createSurat } from '@/features/surat/api'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { cariJenis, perihalNomor, type KodeNomorKontrak } from '../lib/nomor-surat'

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
    const jenis = useMemo(() => cariJenis(jenisQuery.data ?? [], kode), [jenisQuery.data, kode])

    const buat = useMutation({
        mutationFn: () => {
            if (!jenis) throw new Error(`Jenis surat ${kode} belum ada di Penomoran Surat.`)
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

    const tanpaJenis = !jenisQuery.isPending && !jenis
    const tanpaTanggal = tanggal.trim() === ''
    const bisaBuat = !value && !tanpaJenis && !tanpaTanggal && !buat.isPending
    const keterangan = tanpaJenis
        ? `Jenis surat ${kode} belum ada di Penomoran Surat.`
        : tanpaTanggal
            ? 'Isi tanggal dulu untuk membuat nomor.'
            : null

    return (
        <div className="space-y-2">
            <Label htmlFor={id} className="text-[10px] font-bold uppercase text-muted-foreground">{label}</Label>
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
