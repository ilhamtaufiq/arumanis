import { ImageIcon, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatTanggal, fotoThumbSrc, splitFotoForThumbs } from '../lib/jurnal-helpers'
import type { JurnalEntry, JurnalFoto } from '../types'

interface JurnalListProps {
    entries: JurnalEntry[]
    isLoading: boolean
    onEdit: (entry: JurnalEntry) => void
    onDelete: (entry: JurnalEntry) => void
    onPreview: (photos: JurnalFoto[], index: number) => void
}

const numberFormat = new Intl.NumberFormat('id-ID')

export default function JurnalList({ entries, isLoading, onEdit, onDelete, onPreview }: JurnalListProps) {
    if (isLoading && entries.length === 0) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
            </div>
        )
    }

    if (entries.length === 0) {
        return (
            <p className="py-10 text-center text-sm text-muted-foreground">
                Belum ada kegiatan pada bulan ini.
            </p>
        )
    }

    return (
        <ul className="divide-y">
            {entries.map((entry) => {
                const foto = entry.foto ?? []
                const { visible, remaining } = splitFotoForThumbs(foto)

                return (
                    <li key={entry.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:gap-4">
                        <div className="shrink-0 text-sm font-medium sm:w-24">{formatTanggal(entry.tanggal)}</div>

                        <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary">{entry.rhk !== null ? `RHK ${entry.rhk}` : '–'}</Badge>
                                <span className="text-sm text-muted-foreground">
                                    Output:{' '}
                                    {entry.output !== null ? numberFormat.format(entry.output) : '–'}
                                    {entry.output !== null && entry.satuan ? ` ${entry.satuan}` : ''}
                                </span>
                            </div>
                            <p className="whitespace-pre-line break-words text-sm">{entry.kegiatan}</p>
                            {entry.keterangan && (
                                <p className="break-words text-sm text-muted-foreground">{entry.keterangan}</p>
                            )}

                            {foto.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                    {visible.map((item, index) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => onPreview(foto, index)}
                                            className="overflow-hidden rounded-md border focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                            aria-label={`Lihat foto ${index + 1} kegiatan tanggal ${formatTanggal(entry.tanggal)}`}
                                        >
                                            <img
                                                src={fotoThumbSrc(item)}
                                                alt=""
                                                loading="lazy"
                                                className="h-14 w-14 object-cover"
                                            />
                                        </button>
                                    ))}
                                    {remaining > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => onPreview(foto, visible.length)}
                                            className="flex h-14 w-14 items-center justify-center rounded-md border bg-muted text-sm font-medium"
                                            aria-label={`Lihat ${remaining} foto lainnya`}
                                        >
                                            +{remaining}
                                        </button>
                                    )}
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <ImageIcon className="h-3 w-3" aria-hidden />
                                        {foto.length} foto
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex shrink-0 gap-1">
                            <Button variant="outline" size="icon" onClick={() => onEdit(entry)} aria-label="Ubah kegiatan">
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => onDelete(entry)} aria-label="Hapus kegiatan">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </li>
                )
            })}
        </ul>
    )
}
