import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    createKanbanCard,
    deleteKanbanCard,
    getKanbanBoard,
    importKanbanFromTiket,
    moveKanbanCard,
    updateKanbanCard,
} from '../api/kanban'
import { cloneBoardWithMove } from '../lib/kanban-board'
import type {
    CreateKanbanCardDto,
    ImportKanbanFromTiketDto,
    KanbanBoard,
    MoveKanbanCardDto,
    UpdateKanbanCardDto,
} from '../types'

export const kanbanKeys = {
    all: ['kanban'] as const,
    board: () => [...kanbanKeys.all, 'board'] as const,
}

function unwrapBoard(payload: { data: KanbanBoard } | KanbanBoard): KanbanBoard {
    return 'data' in payload && payload.data ? payload.data : (payload as KanbanBoard)
}

export function useKanbanBoard() {
    return useQuery({
        queryKey: kanbanKeys.board(),
        queryFn: async () => {
            const response = await getKanbanBoard()
            return unwrapBoard(response as { data: KanbanBoard })
        },
    })
}

export function useCreateKanbanCard() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateKanbanCardDto) => createKanbanCard(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: kanbanKeys.board() })
            toast.success('Kartu kanban berhasil ditambahkan')
        },
        onError: () => toast.error('Gagal menambahkan kartu'),
    })
}

export function useImportKanbanFromTiket() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: ImportKanbanFromTiketDto) => importKanbanFromTiket(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: kanbanKeys.board() })
            toast.success('Tiket berhasil diimpor ke kanban')
        },
        onError: (error: unknown) => {
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
            toast.error(message || 'Gagal mengimpor tiket')
        },
    })
}

export function useUpdateKanbanCard() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateKanbanCardDto }) => updateKanbanCard(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: kanbanKeys.board() })
            toast.success('Kartu kanban diperbarui')
        },
        onError: () => toast.error('Gagal memperbarui kartu'),
    })
}

export function useMoveKanbanCard() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: MoveKanbanCardDto }) => moveKanbanCard(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: kanbanKeys.board() })
            const previous = queryClient.getQueryData<KanbanBoard>(kanbanKeys.board())

            if (previous) {
                queryClient.setQueryData(
                    kanbanKeys.board(),
                    cloneBoardWithMove(previous, id, data.column_id, data.position),
                )
            }

            return { previous }
        },
        onError: (_error, _variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(kanbanKeys.board(), context.previous)
            }
            toast.error('Gagal memindahkan kartu')
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: kanbanKeys.board() })
        },
    })
}

export function useDeleteKanbanCard() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => deleteKanbanCard(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: kanbanKeys.board() })
            toast.success('Kartu kanban dihapus')
        },
        onError: () => toast.error('Gagal menghapus kartu'),
    })
}