import { createResourceHooks } from '@/lib/create-resource-hooks'
import { createDraftPekerjaan, deleteDraftPekerjaan, getDraftPekerjaan, updateDraftPekerjaan } from '../api/draft-pekerjaan'

export type DraftPekerjaanListParams = {
    page?: number
    search?: string
    tahun?: string
}

const resource = createResourceHooks<DraftPekerjaanListParams>({
    key: 'draft-pekerjaan',
    listFn: getDraftPekerjaan,
    createFn: createDraftPekerjaan,
    updateFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => updateDraftPekerjaan(id, data),
    deleteFn: deleteDraftPekerjaan,
    messages: {
        deleteSuccess: 'Draft berhasil dihapus',
        deleteError: 'Gagal menghapus draft',
    },
})

export const draftPekerjaanKeys = resource.keys
export const useDraftPekerjaanList = resource.useList
export const useCreateDraftPekerjaan = resource.useCreate!
export const useUpdateDraftPekerjaan = resource.useUpdate!
export const useDeleteDraftPekerjaan = resource.useDelete!