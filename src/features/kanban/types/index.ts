import type { Pekerjaan } from '@/features/pekerjaan/types'
import type { Tiket } from '@/features/tiket/types'
import type { User } from '@/features/users/types'

export type KanbanCardSource = 'manual' | 'tiket'
export type KanbanTiketStatus = 'open' | 'pending' | 'closed'

export interface KanbanCard {
    id: number
    board_id: number
    column_id: number
    position: number
    title: string
    description: string | null
    status_label: string | null
    pekerjaan_id: number | null
    pekerjaan?: Pekerjaan
    tiket_id: number | null
    tiket?: Tiket
    source: KanbanCardSource
    metadata: Record<string, unknown> | null
    created_by: number
    creator?: User
    created_at: string
    updated_at: string
}

export interface KanbanColumn {
    id: number
    board_id: number
    title: string
    position: number
    tiket_status: KanbanTiketStatus | null
    color: string | null
    cards?: KanbanCard[]
}

export interface KanbanBoard {
    id: number
    slug: string
    title: string
    description: string | null
    columns?: KanbanColumn[]
}

export interface CreateKanbanCardDto {
    column_id: number
    title: string
    description?: string
    status_label?: string
    pekerjaan_id?: number | null
    metadata?: Record<string, unknown>
}

export interface UpdateKanbanCardDto {
    title?: string
    description?: string | null
    status_label?: string | null
    pekerjaan_id?: number | null
    metadata?: Record<string, unknown> | null
}

export interface ImportKanbanFromTiketDto {
    tiket_id: number
    column_id?: number
    pekerjaan_id?: number | null
}

export interface MoveKanbanCardDto {
    column_id: number
    position: number
}