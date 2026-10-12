import { ImageIcon, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
    fotoThumbSrc,
    formatTanggalPanjang,
    groupByTanggal,
    rhkTone,
    splitFotoForThumbs,
} from '../lib/jurnal-helpers'
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

    const groups = groupByTanggal(entries)

    return (
        <div className="space-y-6">
            {groups.map((group) => (
                <section key={group.tanggal} aria-label={formatTanggalPanjang(group.tanggal)}>
                    <header className="mb-1 flex flex-wrap items-baseline justify-between gap-2 border-b pb-2">
                        <h3 className="text-sm font-semibold">{formatTanggalPanjang(group.tanggal)}</h3>
                        <span className="text-xs text-muted-foreground">
                            {group.items.length} kegiatan
                        </span>
                    </header>
                    <ul className="divide-y">
                        {group.items.map((entry) => (
                            <JurnalRow
                                key={entry.id}
                                entry={entry}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onPreview={onPreview}
                            />
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    )
}

interface JurnalRowProps {
    entry: JurnalEntry
    onEdit: (entry: JurnalEntry) => void
    onDelete: (entry: JurnalEntry) => void
    onPreview: (photos: JurnalFoto[], index: number) => void
}

function JurnalRow({ entry, onEdit, onDelete, onPreview }: JurnalRowProps) {
    const foto = entry.foto ?? []
    const { visible, remaining } = splitFotoForThumbs(foto)
    const tone = rhkTone(entry.rhk)

    return (
        <li className="flex gap-3 py-3">
            <span className={cn('w-1 shrink-0 self-stretch rounded-full', tone.dot)} aria-hidden />

            <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Badge className={cn('border-0 font-semibold', tone.badge)}>
                        {entry.rhk !== null ? `RHK ${entry.rhk}` : 'Tanpa RHK'}
                    </Badge>
                    {entry.output !== null && (
                        <span className="text-sm tabular-nums">
                            <span className="font-semibold">{numberFormat.format(entry.output)}</span>
                            {entry.satuan && <span className="ml-1 text-muted-foreground">{entry.satuan}</span>}
                        </span>
                    )}
                </div>

                <p className="whitespace-pre-line break-words text-sm leading-relaxed">{entry.kegiatan}</p>
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
                                aria-label={`Lihat foto ${index + 1} kegiatan ${formatTanggalPanjang(entry.tanggal)}`}
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

            <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                <Button variant="outline" size="icon" onClick={() => onEdit(entry)} aria-label="Ubah kegiatan" title="Ubah">
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => onDelete(entry)} aria-label="Hapus kegiatan" title="Hapus">
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>
        </li>
    )
}
