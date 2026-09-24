import { describe, expect, it } from 'vitest'
import {
    avatarToneForName,
    buildCardMetadata,
    getCardMeta,
    initialsForName,
} from '../lib/kanban-card-meta'
import type { KanbanCard } from '../types'

function makeCard(overrides: Partial<KanbanCard> = {}): KanbanCard {
    return {
        id: 1,
        board_id: 1,
        column_id: 10,
        position: 0,
        title: 'Contoh',
        description: null,
        status_label: null,
        pekerjaan_id: null,
        tiket_id: null,
        source: 'manual',
        metadata: null,
        created_by: 1,
        created_at: '',
        updated_at: '',
        ...overrides,
    }
}

describe('kanban-card-meta', () => {
    it('defaults priority to medium without metadata or tiket', () => {
        expect(getCardMeta(makeCard())).toEqual({ priority: 'medium', progress: null, dueDate: null })
    })

    it('inherits priority from tiket', () => {
        const card = makeCard({ source: 'tiket', tiket: { prioritas: 'high' } as KanbanCard['tiket'] })
        expect(getCardMeta(card).priority).toBe('high')
    })

    it('prefers explicit metadata over tiket and pekerjaan', () => {
        const card = makeCard({
            source: 'tiket',
            metadata: { priority: 'low', progress: 40, due_date: '2026-10-01' },
            tiket: { prioritas: 'high' } as KanbanCard['tiket'],
            pekerjaan: { progress_total: 90 } as KanbanCard['pekerjaan'],
        })
        expect(getCardMeta(card)).toEqual({ priority: 'low', progress: 40, dueDate: '2026-10-01' })
    })

    it('clamps progress and rejects invalid due dates', () => {
        const card = makeCard({ metadata: { progress: 150, due_date: 'bukan-tanggal' } })
        expect(getCardMeta(card)).toEqual({ priority: 'medium', progress: 100, dueDate: null })
    })

    it('falls back to pekerjaan progress_total', () => {
        const card = makeCard({ pekerjaan: { progress_total: 33.6 } as KanbanCard['pekerjaan'] })
        expect(getCardMeta(card).progress).toBe(34)
    })

    it('builds metadata preserving unrelated keys', () => {
        const next = buildCardMetadata(
            { priority: 'high', progress: null, dueDate: null },
            { priority: 'low', progress: 20, due_date: '2026-01-01', custom: 'x' },
        )
        expect(next).toEqual({ priority: 'high', custom: 'x' })
    })

    it('generates stable avatar tone and initials', () => {
        expect(avatarToneForName('Budi Santoso')).toBe(avatarToneForName('Budi Santoso'))
        expect(initialsForName('Budi Santoso')).toBe('BS')
        expect(initialsForName('Admin')).toBe('AD')
        expect(initialsForName('')).toBe('?')
    })
})
