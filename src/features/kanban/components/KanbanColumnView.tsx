import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Inbox, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { columnDroppableId } from '../lib/kanban-board'
import type { KanbanCard, KanbanColumn } from '../types'
import { KanbanCardItem } from './KanbanCardItem'

interface KanbanColumnViewProps {
    column: KanbanColumn
    cards: KanbanCard[]
    canManage: boolean
    onAddCard: (columnId: number) => void
    onOpenCard: (card: KanbanCard) => void
}

export function KanbanColumnView({
    column,
    cards,
    canManage,
    onAddCard,
    onOpenCard,
}: KanbanColumnViewProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: columnDroppableId(column.id),
    })

    const accent = column.color ?? '#64748b'

    return (
        <div
            className={
                'flex h-full w-[min(85vw,320px)] shrink-0 snap-center flex-col overflow-hidden rounded-2xl border ' +
                'bg-background/90 shadow-sm backdrop-blur-sm ' +
                'sm:w-[300px] sm:snap-start lg:w-[320px]'
            }
        >
            <div
                className="relative border-b px-3 py-3 sm:px-4 sm:py-3.5"
                style={{
                    background: `linear-gradient(135deg, ${accent}14 0%, transparent 70%)`,
                }}
            >
                <div
                    className="absolute inset-x-0 top-0 h-1"
                    style={{ background: `linear-gradient(90deg, ${accent}, ${accent}55)` }}
                />
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-background"
                                style={{ backgroundColor: accent }}
                            />
                            <h3 className="truncate text-sm font-semibold tracking-tight">{column.title}</h3>
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                                {cards.length}
                            </span>
                        </div>
                        {column.tiket_status && (
                            <p className="mt-1 pl-5 text-[11px] uppercase tracking-wider text-muted-foreground">
                                Sync tiket: {column.tiket_status}
                            </p>
                        )}
                    </div>
                    {canManage && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 shrink-0 rounded-lg hover:bg-background sm:h-8 sm:w-8"
                            onClick={() => onAddCard(column.id)}
                            aria-label={`Tambah kartu di ${column.title}`}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <div
                ref={setNodeRef}
                className={cn(
                    'flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-y-contain p-2.5 transition-colors sm:gap-3 sm:p-3',
                    isOver && 'bg-primary/5',
                )}
            >
                <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
                    {cards.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-3 py-8 text-center sm:px-4 sm:py-10">
                            <Inbox className="mb-2 h-7 w-7 text-muted-foreground/70 sm:h-8 sm:w-8" />
                            <p className="text-sm font-medium text-muted-foreground">Kolom kosong</p>
                            <p className="mt-1 max-w-[16rem] text-xs text-muted-foreground">
                                {canManage
                                    ? 'Tahan kartu lalu tarik ke sini, atau tambah baru'
                                    : 'Belum ada kartu di kolom ini'}
                            </p>
                        </div>
                    ) : (
                        cards.map((card) => (
                            <KanbanCardItem
                                key={card.id}
                                card={card}
                                canManage={canManage}
                                accentColor={accent}
                                onOpen={onOpenCard}
                            />
                        ))
                    )}
                </SortableContext>
            </div>
        </div>
    )
}