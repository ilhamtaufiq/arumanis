import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { formatDistanceToNow } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import {
    ArrowUpRight,
    BadgeCheck,
    CalendarDays,
    Flame,
    GripVertical,
    Link2,
    MapPin,
    MessageSquare,
    Minus,
    Package,
    PenLine,
    type LucideIcon,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { getDesaName, getKecamatanName } from '@/lib/wilayah-fields'
import { avatarToneForName, getCardMeta, initialsForName, type CardPriority } from '../lib/kanban-card-meta'
import type { KanbanCard, KanbanColumn } from '../types'

const priorityBadgeConfig: Record<CardPriority, { icon: LucideIcon; variant: 'destructive' | 'secondary'; className: string; label: string }> = {
    high: { icon: Flame, variant: 'destructive', className: 'border-transparent', label: 'Tinggi' },
    medium: {
        icon: ArrowUpRight,
        variant: 'secondary',
        className: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
        label: 'Sedang',
    },
    low: {
        icon: Minus,
        variant: 'secondary',
        className: 'bg-slate-500/10 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300',
        label: 'Rendah',
    },
}

type KanbanCardV2ItemProps = {
    card: KanbanCard
    column: KanbanColumn
    canManage: boolean
    accentColor?: string
    onOpen: (card: KanbanCard) => void
}

/**
 * Dashboard-v2 pilot (kanban): estetika `TaskCard` temp-apps di atas data real.
 * Prioritas/progres/tenggat berasal dari `metadata` kartu (fallback: prioritas
 * tiket, progres pekerjaan). Tidak ada angka mock.
 */
export function KanbanCardV2Item({ card, column, canManage, accentColor = '#64748b', onOpen }: KanbanCardV2ItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: card.id,
        disabled: !canManage,
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const meta = getCardMeta(card)
    const priority = priorityBadgeConfig[meta.priority]
    const PriorityIcon = priority.icon
    const isFromTiket = card.source === 'tiket'
    const isDone = column.tiket_status === 'closed'
    const ownerName = card.creator?.name ?? null
    const dueLabel = meta.dueDate
        ? new Date(`${meta.dueDate}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        : null
    const updatedLabel = card.updated_at
        ? formatDistanceToNow(new Date(card.updated_at), { addSuffix: true, locale: localeId })
        : null

    return (
        <article
            ref={setNodeRef}
            style={style}
            className={cn(
                'group relative flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-xs',
                isDragging && 'z-10 rotate-1 shadow-lg ring-2 ring-primary/25',
            )}
        >
            <div
                className='absolute inset-y-0 left-0 w-1 rounded-l-xl'
                style={{ backgroundColor: isFromTiket ? '#8b5cf6' : accentColor }}
            />

            <div className='min-w-0 space-y-1.5 pl-1'>
                <div className='flex items-center justify-between gap-3'>
                    <div className='flex min-w-0 items-center gap-1.5'>
                        {canManage && (
                            <button
                                type='button'
                                className='touch-none cursor-grab rounded p-0.5 text-muted-foreground transition-opacity hover:bg-muted hover:text-foreground active:cursor-grabbing sm:opacity-0 sm:group-hover:opacity-100'
                                aria-label='Geser kartu'
                                {...attributes}
                                {...listeners}
                            >
                                <GripVertical className='h-4 w-4' />
                            </button>
                        )}
                        <h3
                            className='min-w-0 flex-1 cursor-pointer truncate text-sm leading-none font-medium'
                            onClick={() => onOpen(card)}
                        >
                            {card.title}
                        </h3>
                    </div>
                    <Badge
                        variant={priority.variant}
                        className={cn('shrink-0 rounded-md px-2 font-medium', priority.className)}
                    >
                        <PriorityIcon data-icon='inline-start' />
                        {priority.label}
                    </Badge>
                </div>
                {card.description ? (
                    <p className='line-clamp-2 pl-0.5 text-sm leading-5 text-muted-foreground'>{card.description}</p>
                ) : null}
            </div>

            {ownerName || dueLabel ? (
                <div className='flex items-center justify-between pl-1'>
                    <div className='flex min-w-0 items-center gap-1.5'>
                        {ownerName ? (
                            <>
                                <Avatar className={cn('size-5', avatarToneForName(ownerName))}>
                                    <AvatarFallback className='rounded-full text-[10px]'>
                                        {initialsForName(ownerName)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className='truncate text-sm text-muted-foreground'>{ownerName}</span>
                            </>
                        ) : null}
                    </div>
                    {dueLabel ? (
                        <div className='flex min-w-0 items-center gap-1.5 text-muted-foreground'>
                            <span className='truncate text-sm'>{dueLabel}</span>
                            <CalendarDays className='size-3' />
                        </div>
                    ) : null}
                </div>
            ) : null}

            {meta.progress !== null ? (
                <div className='space-y-1.5 pl-1'>
                    <div className='flex items-center justify-between text-xs text-muted-foreground'>
                        <span className='leading-none'>Progres</span>
                        <span className='leading-none tabular-nums'>{meta.progress}%</span>
                    </div>
                    <Progress value={meta.progress} />
                </div>
            ) : null}

            {card.pekerjaan ? (
                <div className='rounded-lg border bg-muted/30 p-2 sm:p-2.5'>
                    <div className='flex items-start gap-2'>
                        <Package className='mt-0.5 h-3.5 w-3.5 shrink-0 text-primary' />
                        <div className='min-w-0'>
                            <p className='truncate text-xs font-medium'>{card.pekerjaan.nama_paket}</p>
                            {(card.pekerjaan.kecamatan || card.pekerjaan.desa) && (
                                <p className='mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground'>
                                    <MapPin className='h-3 w-3 shrink-0' />
                                    <span className='truncate'>
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
            ) : null}

            <Separator />

            <div>
                {isDone ? (
                    <div className='flex items-center gap-1 text-sm font-medium text-green-700 dark:text-green-600'>
                        <BadgeCheck className='size-4' />
                        Selesai
                    </div>
                ) : (
                    <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground'>
                        <span className='flex items-center gap-1.5'>
                            {isFromTiket ? <MessageSquare className='size-3.5' /> : <PenLine className='size-3.5' />}
                            {isFromTiket ? 'Tiket' : 'Manual'}
                        </span>
                        {card.tiket_id ? (
                            <span className='flex items-center gap-1.5'>
                                <Link2 className='size-3.5' />#{card.tiket_id}
                            </span>
                        ) : null}
                        {updatedLabel ? <span className='truncate text-xs'>{updatedLabel}</span> : null}
                    </div>
                )}
            </div>
        </article>
    )
}
