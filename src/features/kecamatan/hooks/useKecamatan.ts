import { createResourceHooks } from '@/lib/create-resource-hooks'
import { createKecamatan, deleteKecamatan, getKecamatan, getKecamatanById, updateKecamatan } from '../api/kecamatan'

const resource = createResourceHooks({
    key: 'kecamatan',
    listFn: () => getKecamatan(),
    detailFn: getKecamatanById,
    createFn: createKecamatan,
    updateFn: ({ id, data }: { id: number; data: { n_kec: string } }) => updateKecamatan(id, data),
    deleteFn: deleteKecamatan,
    messages: {
        createSuccess: 'Kecamatan berhasil ditambahkan',
        createError: 'Gagal menambahkan kecamatan',
        updateSuccess: 'Kecamatan berhasil diperbarui',
        updateError: 'Gagal memperbarui kecamatan',
        deleteSuccess: 'Kecamatan berhasil dihapus',
        deleteError: 'Gagal menghapus kecamatan',
    },
})

export const kecamatanKeys = resource.keys
export const useKecamatanList = resource.useList
export const useKecamatanDetail = resource.useDetail
export const useCreateKecamatan = resource.useCreate!
export const useUpdateKecamatan = resource.useUpdate!
export const useDeleteKecamatan = resource.useDelete!