import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { formatDistanceToNow } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { GripVertical, Link2, MapPin, MessageSquare, Package, PenLine } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getDesaName, getKecamatanName } from '@/lib/wilayah-fields'
import type { KanbanCard } from '../types'

interface KanbanCardItemProps {
    card: KanbanCard
    canManage: boolean
    accentColor?: string
    onOpen: (card: KanbanCard) => void
}

export function KanbanCardItem({ card, canManage, accentColor = '#64748b', onOpen }: KanbanCardItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: card.id,
        disabled: !canManage,
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const isFromTiket = card.source === 'tiket'
    const updatedLabel = card.updated_at
        ? formatDistanceToNow(new Date(card.updated_at), { addSuffix: true, locale: localeId })
        : null

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200',
                'hover:border-primary/20 hover:shadow-md sm:hover:-translate-y-0.5',
                isDragging && 'z-10 rotate-1 opacity-90 shadow-xl ring-2 ring-primary/25',
            )}
        >
            <div
                className="absolute inset-y-0 left-0 w-1"
                style={{ backgroundColor: isFromTiket ? '#8b5cf6' : accentColor }}
            />

            <div className="flex items-start gap-0.5 p-2.5 pl-3.5 sm:gap-1 sm:p-3 sm:pl-4">
                {canManage && (
                    <button
                        type="button"
                        className={
                            'mt-0.5 touch-none cursor-grab rounded p-1 text-muted-foreground transition-opacity ' +
                            'hover:bg-muted hover:text-foreground active:cursor-grabbing ' +
                            // Always visible on touch/small screens; fade-in on hover for desktop
                            'opacity-70 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100'
                        }
                        aria-label="Geser kartu"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="h-4 w-4" />
                    </button>
                )}

                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onOpen(card)}>
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-pretty text-sm font-semibold leading-snug tracking-tight">{card.title}</p>
                        <Badge
                            variant="secondary"
                            className={cn(
                                'shrink-0 gap-1 px-1.5 py-0 text-[10px] font-medium',
                                isFromTiket ? 'bg-violet-500/10 text-violet-700 dark:text-violet-300' : 'bg-muted',
                            )}
                        >
                            {isFromTiket ? <MessageSquare className="h-3 w-3" /> : <PenLine className="h-3 w-3" />}
                            {isFromTiket ? 'Tiket' : 'Manual'}
                        </Badge>
                    </div>

                    {card.status_label && (
                        <p className="mt-2 inline-flex max-w-full truncate rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:text-amber-200">
                            {card.status_label}
                        </p>
                    )}

                    {card.description && (
                        <p className="mt-2 line-clamp-2 text-pretty text-xs leading-relaxed text-muted-foreground">
                            {card.description}
                        </p>
                    )}

                    {card.pekerjaan && (
                        <div className="mt-2.5 rounded-lg border bg-muted/30 p-2 sm:mt-3 sm:p-2.5">
                            <div className="flex items-start gap-2">
                                <Package className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-medium">{card.pekerjaan.nama_paket}</p>
                                    {(card.pekerjaan.kecamatan || card.pekerjaan.desa) && (
                                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                                            <MapPin className="h-3 w-3 shrink-0" />
                                            <span className="truncate">
                                                {[
                                                    getKecamatanName(card.pekerjaan.kecamatan),
                                                    getDesaName(card.pekerjaan.desa),
                                                ]
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground sm:mt-3">
                        {updatedLabel && <span className="truncate">{updatedLabel}</span>}
                        {card.tiket_id && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                                <Link2 className="h-3 w-3" />
                                #{card.tiket_id}
                            </span>
                        )}
                    </div>
                </button>
            </div>
        </div>
    )
}