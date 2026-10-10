import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatTanggal } from '../lib/jurnal-helpers'
import type { JurnalEntry } from '../types'

interface JurnalListProps {
    entries: JurnalEntry[]
    isLoading: boolean
    onEdit: (entry: JurnalEntry) => void
    onDelete: (entry: JurnalEntry) => void
}

const numberFormat = new Intl.NumberFormat('id-ID')

export default function JurnalList({ entries, isLoading, onEdit, onDelete }: JurnalListProps) {
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
            {entries.map((entry) => (
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
            ))}
        </ul>
    )
}
