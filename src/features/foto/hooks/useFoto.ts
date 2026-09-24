import { createResourceHooks } from '@/lib/create-resource-hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { bulkDeleteFotos, createFoto, deleteFoto, getFoto, getFotoList, updateFoto } from '../api'
import type { FotoParams } from '../types'

const resource = createResourceHooks<FotoParams, FormData, { id: number; data: FormData }>({
    key: 'foto',
    listFn: getFotoList,
    detailFn: getFoto,
    createFn: createFoto,
    updateFn: updateFoto,
    deleteFn: deleteFoto,
    messages: {
        deleteSuccess: 'Foto berhasil dihapus',
        deleteError: 'Gagal menghapus foto',
    },
})

export const fotoKeys = resource.keys
export const useFotoList = resource.useList
export const useFotoDetail = resource.useDetail
export const useCreateFoto = resource.useCreate!
export const useUpdateFoto = resource.useUpdate!
export const useDeleteFoto = resource.useDelete!

export function useBulkDeleteFotos() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: bulkDeleteFotos,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: fotoKeys.all })
            toast.success('Foto terpilih berhasil dihapus')
        },
        onError: () => toast.error('Gagal menghapus foto'),
    })
}