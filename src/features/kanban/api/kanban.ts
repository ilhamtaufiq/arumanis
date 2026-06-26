import api from '@/lib/api-client'
import type {
    CreateKanbanCardDto,
    ImportKanbanFromTiketDto,
    KanbanBoard,
    KanbanCard,
    MoveKanbanCardDto,
    UpdateKanbanCardDto,
} from '../types'

export async function getKanbanBoard() {
    return api.get<{ data: KanbanBoard }>('/kanban/board')
}

export async function createKanbanCard(data: CreateKanbanCardDto) {
    return api.post<{ data: KanbanCard }>('/kanban/cards', data)
}

export async function importKanbanFromTiket(data: ImportKanbanFromTiketDto) {
    return api.post<{ data: KanbanCard }>('/kanban/cards/from-tiket', data)
}

export async function updateKanbanCard(id: number, data: UpdateKanbanCardDto) {
    return api.put<{ data: KanbanCard }>(`/kanban/cards/${id}`, data)
}

export async function moveKanbanCard(id: number, data: MoveKanbanCardDto) {
    return api.patch<{ data: KanbanCard }>(`/kanban/cards/${id}/move`, data)
}

export async function deleteKanbanCard(id: number) {
    await api.delete(`/kanban/cards/${id}`)
}