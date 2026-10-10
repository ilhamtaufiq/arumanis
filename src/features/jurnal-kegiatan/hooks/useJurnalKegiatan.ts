import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api-client'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { createJurnal, deleteJurnal, getJurnalList, updateJurnal } from '../api/jurnal-kegiatan'
import type { JurnalParams, JurnalPayload } from '../types'

export const jurnalKeys = {
    all: ['jurnal-kegiatan'] as const,
    list: (params: JurnalParams) => [...jurnalKeys.all, 'list', params.tahun, params.bulan] as const,
}

/** Error 422 ditampilkan per field di form, jadi tidak perlu toast global. */
function shouldToast(error: unknown) {
    return !(error instanceof ApiError && error.status === 422)
}

export function useJurnalList(params: JurnalParams) {
    return useQuery({
        queryKey: jurnalKeys.list(params),
        queryFn: () => getJurnalList(params),
        placeholderData: keepPreviousData,
    })
}

export function useCreateJurnal() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: JurnalPayload) => createJurnal(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: jurnalKeys.all })
            toast.success('Kegiatan berhasil ditambahkan')
        },
        onError: (error) => {
            if (shouldToast(error)) toast.error(getApiErrorMessage(error, 'Gagal menyimpan kegiatan'))
        },
    })
}

export function useUpdateJurnal() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: JurnalPayload }) => updateJurnal(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: jurnalKeys.all })
            toast.success('Kegiatan berhasil diperbarui')
        },
        onError: (error) => {
            if (shouldToast(error)) toast.error(getApiErrorMessage(error, 'Gagal memperbarui kegiatan'))
        },
    })
}

export function useDeleteJurnal() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => deleteJurnal(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: jurnalKeys.all })
            toast.success('Kegiatan berhasil dihapus')
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, 'Gagal menghapus kegiatan'))
        },
    })
}
