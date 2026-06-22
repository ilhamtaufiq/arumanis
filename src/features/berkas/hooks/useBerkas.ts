import { createResourceHooks } from '@/lib/create-resource-hooks'
import { createBerkas, deleteBerkas, getBerkas, getBerkasList, updateBerkas } from '../api'
import type { BerkasParams } from '../types'

const resource = createResourceHooks<BerkasParams, FormData, { id: number; data: FormData }>({
    key: 'berkas',
    listFn: getBerkasList,
    detailFn: getBerkas,
    createFn: createBerkas,
    updateFn: updateBerkas,
    deleteFn: deleteBerkas,
    messages: {
        deleteSuccess: 'Berkas berhasil dihapus',
        deleteError: 'Gagal menghapus berkas',
    },
})

export const berkasKeys = resource.keys
export const useBerkasList = resource.useList
export const useBerkasDetail = resource.useDetail
export const useCreateBerkas = resource.useCreate!
export const useUpdateBerkas = resource.useUpdate!
export const useDeleteBerkas = resource.useDelete!