import { useRef, useState, type ChangeEvent } from 'react'
import { ImageIcon, Trash2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api-client'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { useDeleteJurnalBukti, useUploadJurnalBukti } from '../hooks/useJurnalKegiatan'
import { FOTO_ACCEPT_ATTR, FOTO_MAX_BYTES, fotoErrorMessage, fotoThumbSrc, formatBytesMb } from '../lib/jurnal-helpers'
import { firstErrorMessage } from '../lib/rhk-helpers'
import { BUKTI_MAX_COUNT, sisaSlotBukti, validateBuktiSelection, type BuktiCard as BuktiCardData } from '../lib/bukti-helpers'
import type { JurnalFoto } from '../types'

interface BuktiRhkCardProps {
    card: BuktiCardData
    tahun: number
    bulan: number
    monthLabel: string
    onPreview: (photos: JurnalFoto[], index: number) => void
}

/** Pesan 422 untuk kartu ini: errors.foto atau errors.rhk. Selain itu, pesan umum. */
function errorFromUpload(error: unknown, fallback: string): string {
    if (error instanceof ApiError && error.status === 422) {
        const errors = (error.data as { errors?: Record<string, string[] | string> } | undefined)?.errors
        const foto = fotoErrorMessage(errors)
        if (foto) return foto
        const rhk = firstErrorMessage(errors, 'rhk')
        if (rhk) return rhk
    }
    return getApiErrorMessage(error, fallback)
}

export default function BuktiRhkCard({ card, tahun, bulan, monthLabel, onPreview }: BuktiRhkCardProps) {
    const [notices, setNotices] = useState<string[]>([])
    const [cardError, setCardError] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)
    const uploadMutation = useUploadJurnalBukti()
    const deleteMutation = useDeleteJurnalBukti()

    const count = card.foto.length
    const sisa = sisaSlotBukti(count)
    const title = card.orphan ? card.rhk : `RHK ${card.no}`
    const subtitle = card.orphan ? null : card.rhk

    const handlePick = async (event: ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(event.target.files ?? [])
        event.target.value = ''
        const { accepted, messages } = validateBuktiSelection(picked, count)
        setNotices(messages)
        setCardError(null)
        if (accepted.length === 0) return

        setBusy(true)
        try {
            await uploadMutation.mutateAsync({ tahun, bulan, rhk: card.no, files: accepted })
        } catch (error) {
            setCardError(errorFromUpload(error, `Gagal mengunggah foto bukti RHK ${card.no}`))
        } finally {
            setBusy(false)
        }
    }

    const handleDelete = async (mediaId: number) => {
        setBusy(true)
        setCardError(null)
        try {
            await deleteMutation.mutateAsync(mediaId)
        } catch (error) {
            setCardError(errorFromUpload(error, 'Gagal menghapus foto bukti'))
        } finally {
            setBusy(false)
        }
    }

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="text-base">
                    {title}
                    {subtitle && <span className="block text-sm font-normal text-muted-foreground">{subtitle}</span>}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3">
                {count === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Belum ada foto bukti RHK {card.no} untuk bulan ini.
                    </p>
                ) : (
                    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {card.foto.map((item, index) => (
                            <li key={item.id} className="relative">
                                <button
                                    type="button"
                                    onClick={() => onPreview(card.foto, index)}
                                    className="block w-full overflow-hidden rounded-md border focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                    aria-label={`Lihat foto ${index + 1} RHK ${card.no}`}
                                >
                                    <img src={fotoThumbSrc(item)} alt="" loading="lazy" className="h-20 w-full object-cover" />
                                </button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6 rounded-full"
                                    onClick={() => handleDelete(item.id)}
                                    disabled={busy}
                                    aria-label={`Hapus foto ${index + 1} RHK ${card.no}`}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}

                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ImageIcon className="h-3 w-3" aria-hidden />
                    {count} dari {BUKTI_MAX_COUNT} foto
                </p>

                {notices.length > 0 && (
                    <ul role="alert" className="space-y-1 text-xs font-medium text-destructive">
                        {notices.map((message) => (
                            <li key={message} className="flex items-start justify-between gap-2">
                                <span>{message}</span>
                                <Button type="button" variant="ghost" size="icon" className="h-5 w-5 shrink-0" onClick={() => setNotices((prev) => prev.filter((m) => m !== message))} aria-label="Tutup pesan">
                                    <X className="h-3 w-3" />
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}

                {cardError && (
                    <p role="alert" className="rounded-md border border-destructive/50 bg-destructive/10 p-2 text-sm text-destructive">
                        {cardError}
                    </p>
                )}

                <div className="mt-auto space-y-1">
                    <Input
                        ref={fileRef}
                        type="file"
                        accept={FOTO_ACCEPT_ATTR}
                        multiple
                        onChange={handlePick}
                        disabled={busy || sisa === 0}
                        className="sr-only"
                        aria-label={`Pilih foto bukti RHK ${card.no} untuk ${monthLabel}`}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={busy || sisa === 0}
                        onClick={() => fileRef.current?.click()}
                    >
                        <Upload className="h-4 w-4" />
                        {busy ? 'Mengunggah...' : 'Tambah foto'}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                        JPG atau PNG, maks. {formatBytesMb(FOTO_MAX_BYTES)} per berkas. Sisa {sisa} slot.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
