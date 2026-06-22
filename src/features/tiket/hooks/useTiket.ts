import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createResourceHooks } from '@/lib/create-resource-hooks'
import {
    bulkUpdateTiket,
    createTiket,
    createTiketComment,
    deleteTiket,
    getTiketById,
    getTiketList,
    updateTiket,
} from '../api/tiket'
import type { TiketAdminUpdateData, TiketFormData, TiketParams, TiketStatus } from '../types'

const resource = createResourceHooks<TiketParams, FormData | TiketFormData, { id: number; data: FormData | TiketFormData | TiketAdminUpdateData }>({
    key: 'tiket',
    listFn: getTiketList,
    detailFn: getTiketById,
    createFn: createTiket,
    updateFn: ({ id, data }) => updateTiket(id, data),
    deleteFn: deleteTiket,
    messages: {
        deleteSuccess: 'Tiket berhasil dihapus',
        deleteError: 'Gagal menghapus tiket',
    },
})

export const tiketKeys = resource.keys
export const useTiketList = resource.useList
export const useTiketDetail = resource.useDetail
export const useCreateTiket = resource.useCreate!
export const useUpdateTiket = resource.useUpdate!
export const useDeleteTiket = resource.useDelete!

export function useBulkUpdateTiket() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ ids, status }: { ids: number[]; status: TiketStatus }) => bulkUpdateTiket(ids, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tiketKeys.all })
        },
    })
}

export function useCreateTiketComment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ tiketId, message }: { tiketId: number; message: string }) => createTiketComment(tiketId, message),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tiketKeys.all })
        },
    })
}