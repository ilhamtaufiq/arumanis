import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSurat, deleteSurat, getSuratList, getSuratPratinjau, updateSurat, type SuratListParams } from '../api'
import type { SuratFormData } from '../types'

export const suratKeys = {
    all: ['surat'] as const,
    list: (params: SuratListParams) => [...suratKeys.all, 'list', params] as const,
    pratinjau: (params: { tahun: number; type_id: number; tanggal: string }) =>
        [...suratKeys.all, 'pratinjau', params] as const,
}

export function useSuratList(params: SuratListParams) {
    return useQuery({
        queryKey: suratKeys.list(params),
        queryFn: () => getSuratList(params),
        placeholderData: (previous) => previous,
    })
}

export function useSuratPratinjau(params: { tahun: number; type_id: number; tanggal: string } | null) {
    return useQuery({
        queryKey: params ? suratKeys.pratinjau(params) : [...suratKeys.all, 'pratinjau', 'off'],
        queryFn: async () => (await getSuratPratinjau(params!)).data,
        enabled: params !== null,
        staleTime: 0,
    })
}

export function useCreateSurat() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: SuratFormData) => createSurat(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: suratKeys.all }),
    })
}

export function useUpdateSurat() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: SuratFormData }) => updateSurat(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: suratKeys.all }),
    })
}

export function useDeleteSurat() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => deleteSurat(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: suratKeys.all }),
    })
}
