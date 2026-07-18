import { getDesaName, getKecamatanName } from '@/lib/wilayah-fields'
import type { KanbanBoard, KanbanCard, KanbanColumn } from '../types'

export function columnDroppableId(columnId: number): string {
    return `column-${columnId}`
}

export function parseColumnDroppableId(id: string | number): number | null {
    const value = String(id)
    if (!value.startsWith('column-')) return null
    const parsed = Number(value.replace('column-', ''))
    return Number.isFinite(parsed) ? parsed : null
}

export function findCardColumnId(board: KanbanBoard, cardId: number): number | null {
    for (const column of board.columns ?? []) {
        if ((column.cards ?? []).some((card) => card.id === cardId)) {
            return column.id
        }
    }
    return null
}

export function getColumnCards(board: KanbanBoard, columnId: number): KanbanCard[] {
    const column = board.columns?.find((item) => item.id === columnId)
    return [...(column?.cards ?? [])].sort((a, b) => a.position - b.position)
}

export function resolveDropTarget(
    board: KanbanBoard,
    overId: string | number,
): { columnId: number; position: number } | null {
    const columnFromDroppable = parseColumnDroppableId(overId)
    if (columnFromDroppable) {
        return {
            columnId: columnFromDroppable,
            position: getColumnCards(board, columnFromDroppable).length,
        }
    }

    const overCardId = Number(overId)
    if (!Number.isFinite(overCardId)) return null

    const columnId = findCardColumnId(board, overCardId)
    if (!columnId) return null

    const cards = getColumnCards(board, columnId)
    const index = cards.findIndex((card) => card.id === overCardId)

    return {
        columnId,
        position: index >= 0 ? index : cards.length,
    }
}

export function cloneBoardWithMove(
    board: KanbanBoard,
    cardId: number,
    targetColumnId: number,
    targetPosition: number,
): KanbanBoard {
    const columns = (board.columns ?? []).map((column) => ({
        ...column,
        cards: [...(column.cards ?? [])].sort((a, b) => a.position - b.position),
    }))

    let movingCard: KanbanCard | null = null

    for (const column of columns) {
        const index = column.cards.findIndex((card) => card.id === cardId)
        if (index >= 0) {
            movingCard = column.cards.splice(index, 1)[0]
            column.cards.forEach((card, idx) => {
                card.position = idx
            })
            break
        }
    }

    if (!movingCard) return board

    const targetColumn = columns.find((column) => column.id === targetColumnId)
    if (!targetColumn) return board

    const nextCard: KanbanCard = {
        ...movingCard,
        column_id: targetColumnId,
        position: targetPosition,
    }

    targetColumn.cards.splice(targetPosition, 0, nextCard)
    targetColumn.cards.forEach((card, idx) => {
        card.position = idx
    })

    return {
        ...board,
        columns,
    }
}

export function sortColumns(columns: KanbanColumn[]): KanbanColumn[] {
    return [...columns].sort((a, b) => a.position - b.position)
}

export type KanbanSourceFilter = 'all' | 'manual' | 'tiket'

export type KanbanBoardStats = {
    total: number
    manual: number
    fromTiket: number
    byColumn: Record<number, number>
}

export function computeBoardStats(board: KanbanBoard): KanbanBoardStats {
    const byColumn: Record<number, number> = {}
    let total = 0
    let manual = 0
    let fromTiket = 0

    for (const column of board.columns ?? []) {
        const count = column.cards?.length ?? 0
        byColumn[column.id] = count
        total += count

        for (const card of column.cards ?? []) {
            if (card.source === 'tiket') fromTiket += 1
            else manual += 1
        }
    }

    return { total, manual, fromTiket, byColumn }
}

export function filterKanbanBoard(
    board: KanbanBoard,
    options: { search?: string; source?: KanbanSourceFilter },
): KanbanBoard {
    const search = options.search?.trim().toLowerCase() ?? ''
    const source = options.source ?? 'all'

    const columns = (board.columns ?? []).map((column) => {
        const cards = (column.cards ?? []).filter((card) => {
            if (source !== 'all' && card.source !== source) return false
            if (!search) return true

            const haystack = [
                card.title,
                card.description,
                card.status_label,
                card.pekerjaan?.nama_paket,
                getKecamatanName(card.pekerjaan?.kecamatan),
                getDesaName(card.pekerjaan?.desa),
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()

            return haystack.includes(search)
        })

        return { ...column, cards }
    })

    return { ...board, columns }
}