import { describe, expect, it } from 'vitest'
import {
    cloneBoardWithMove,
    columnDroppableId,
    computeBoardStats,
    filterKanbanBoard,
    findCardColumnId,
    parseColumnDroppableId,
    resolveDropTarget,
} from '../lib/kanban-board'
import type { KanbanBoard } from '../types'

const board: KanbanBoard = {
    id: 1,
    slug: 'organisasi',
    title: 'Kanban Organisasi',
    description: null,
    columns: [
        {
            id: 10,
            board_id: 1,
            title: 'Baru',
            position: 0,
            tiket_status: 'open',
            color: '#3b82f6',
            cards: [
                {
                    id: 1,
                    board_id: 1,
                    column_id: 10,
                    position: 0,
                    title: 'A',
                    description: null,
                    status_label: null,
                    pekerjaan_id: null,
                    tiket_id: null,
                    source: 'manual',
                    metadata: null,
                    created_by: 1,
                    created_at: '',
                    updated_at: '',
                },
                {
                    id: 2,
                    board_id: 1,
                    column_id: 10,
                    position: 1,
                    title: 'B',
                    description: null,
                    status_label: null,
                    pekerjaan_id: null,
                    tiket_id: null,
                    source: 'manual',
                    metadata: null,
                    created_by: 1,
                    created_at: '',
                    updated_at: '',
                },
            ],
        },
        {
            id: 11,
            board_id: 1,
            title: 'Proses',
            position: 1,
            tiket_status: 'pending',
            color: '#f59e0b',
            cards: [],
        },
    ],
}

describe('kanban-board utils', () => {
    it('parses column droppable ids', () => {
        expect(columnDroppableId(11)).toBe('column-11')
        expect(parseColumnDroppableId('column-11')).toBe(11)
        expect(parseColumnDroppableId(99)).toBeNull()
    })

    it('finds card column and drop target', () => {
        expect(findCardColumnId(board, 2)).toBe(10)
        expect(resolveDropTarget(board, 'column-11')).toEqual({ columnId: 11, position: 0 })
        expect(resolveDropTarget(board, 2)).toEqual({ columnId: 10, position: 1 })
    })

    it('clones board when moving cards across columns', () => {
        const next = cloneBoardWithMove(board, 2, 11, 0)
        const source = next.columns?.find((column) => column.id === 10)
        const target = next.columns?.find((column) => column.id === 11)

        expect(source?.cards).toHaveLength(1)
        expect(target?.cards).toHaveLength(1)
        expect(target?.cards?.[0]?.id).toBe(2)
        expect(target?.cards?.[0]?.column_id).toBe(11)
    })

    it('computes stats and filters cards', () => {
        const stats = computeBoardStats(board)
        expect(stats.total).toBe(2)
        expect(stats.manual).toBe(2)
        expect(stats.byColumn[10]).toBe(2)

        const filtered = filterKanbanBoard(board, { search: 'b', source: 'manual' })
        expect(filtered.columns?.[0]?.cards).toHaveLength(1)
        expect(filtered.columns?.[0]?.cards?.[0]?.title).toBe('B')
    })
})