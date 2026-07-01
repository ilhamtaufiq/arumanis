import { useMemo, useState } from 'react'
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    closestCorners,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core'
import { Loader2 } from 'lucide-react'
import { findCardColumnId, getColumnCards, resolveDropTarget, sortColumns } from '../lib/kanban-board'
import type { KanbanBoard, KanbanCard } from '../types'
import { useMoveKanbanCard } from '../hooks/useKanban'
import { KanbanCardItem } from './KanbanCardItem'
import { KanbanColumnView } from './KanbanColumnView'
import { KanbanCardDialog } from './KanbanCardDialog'
import { ImportFromTiketDialog } from './ImportFromTiketDialog'

interface KanbanBoardViewProps {
    board: KanbanBoard
    canManage: boolean
    importOpen: boolean
    onImportOpenChange: (open: boolean) => void
}

export function KanbanBoardView({
    board,
    canManage,
    importOpen,
    onImportOpenChange,
}: KanbanBoardViewProps) {
    const moveMutation = useMoveKanbanCard()
    const [activeCard, setActiveCard] = useState<KanbanCard | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogColumnId, setDialogColumnId] = useState<number | null>(null)
    const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
    )

    const columns = useMemo(() => sortColumns(board.columns ?? []), [board.columns])

    const openCreateDialog = (columnId: number) => {
        setSelectedCard(null)
        setDialogColumnId(columnId)
        setDialogOpen(true)
    }

    const openEditDialog = (card: KanbanCard) => {
        setSelectedCard(card)
        setDialogColumnId(card.column_id)
        setDialogOpen(true)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveCard(null)
        if (!canManage) return

        const { active, over } = event
        if (!over || active.id === over.id) return

        const cardId = Number(active.id)
        const sourceColumnId = findCardColumnId(board, cardId)
        const target = resolveDropTarget(board, over.id)

        if (!sourceColumnId || !target) return

        const sourceCards = getColumnCards(board, sourceColumnId)
        const sourceIndex = sourceCards.findIndex((card) => card.id === cardId)
        let position = target.position

        if (sourceColumnId === target.columnId && sourceIndex < target.position) {
            position = Math.max(0, target.position - 1)
        }

        await moveMutation.mutateAsync({
            id: cardId,
            data: {
                column_id: target.columnId,
                position,
            },
        })
    }

    const activeAccent =
        columns.find((column) => column.cards?.some((card) => card.id === activeCard?.id))?.color ?? undefined

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={(event) => {
                    const cardId = Number(event.active.id)
                    for (const column of columns) {
                        const card = (column.cards ?? []).find((item) => item.id === cardId)
                        if (card) {
                            setActiveCard(card)
                            break
                        }
                    }
                }}
                onDragEnd={handleDragEnd}
                onDragCancel={() => setActiveCard(null)}
            >
                <div className="flex h-full gap-4 overflow-x-auto overflow-y-hidden pb-1">
                    {columns.map((column) => (
                        <KanbanColumnView
                            key={column.id}
                            column={column}
                            cards={getColumnCards(board, column.id)}
                            canManage={canManage}
                            onAddCard={openCreateDialog}
                            onOpenCard={openEditDialog}
                        />
                    ))}
                </div>

                <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1)' }}>
                    {activeCard ? (
                        <div className="w-[320px] cursor-grabbing">
                            <KanbanCardItem
                                card={activeCard}
                                canManage={canManage}
                                accentColor={activeAccent}
                                onOpen={() => undefined}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {moveMutation.isPending && (
                <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border bg-background/95 px-4 py-2.5 text-sm shadow-lg backdrop-blur">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Menyimpan posisi...
                </div>
            )}

            <KanbanCardDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                columnId={dialogColumnId}
                card={selectedCard}
                canManage={canManage}
            />

            <ImportFromTiketDialog
                open={importOpen}
                onOpenChange={onImportOpenChange}
                board={board}
            />
        </>
    )
}