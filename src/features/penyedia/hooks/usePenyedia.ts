import { createResourceHooks } from '@/lib/create-resource-hooks'
import { createPenyedia, deletePenyedia, getPenyedia, getPenyediaById, updatePenyedia } from '../api/penyedia'
import type { PenyediaDto } from '../types'

export type PenyediaListParams = {
    page?: number
    search?: string
    per_page?: number
}

const resource = createResourceHooks<
    PenyediaListParams,
    PenyediaDto,
    { id: number; data: PenyediaDto }
>({
    key: 'penyedia',
    listFn: getPenyedia,
    detailFn: getPenyediaById,
    createFn: createPenyedia,
    updateFn: ({ id, data }) => updatePenyedia(id, data),
    deleteFn: deletePenyedia,
    messages: {
        createSuccess: 'Penyedia berhasil ditambahkan',
        createError: 'Gagal menambahkan penyedia',
        updateSuccess: 'Penyedia berhasil diperbarui',
        updateError: 'Gagal memperbarui penyedia',
        deleteSuccess: 'Penyedia berhasil dihapus',
        deleteError: 'Gagal menghapus penyedia',
    },
})

export const penyediaKeys = resource.keys
export const usePenyediaList = resource.useList
export const usePenyediaDetail = resource.useDetail
export const useCreatePenyedia = resource.useCreate!
export const useUpdatePenyedia = resource.useUpdate!
export const useDeletePenyedia = resource.useDelete!