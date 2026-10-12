import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createInformasi, deleteInformasi, getInformasiList, updateInformasi } from '../api'
import type { InformasiFormData, InformasiKategori } from '../types'

export const informasiKeys = {
    all: ['informasi'] as const,
    list: (kategori: InformasiKategori | undefined) => [...informasiKeys.all, 'list', kategori ?? 'semua'] as const,
}

export function useInformasiList(kategori: InformasiKategori | undefined) {
    return useQuery({
        queryKey: informasiKeys.list(kategori),
        queryFn: async () => (await getInformasiList({ kategori })).data,
        placeholderData: (previous) => previous,
    })
}

export function useCreateInformasi() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: InformasiFormData) => createInformasi(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: informasiKeys.all }),
    })
}

export function useUpdateInformasi() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: InformasiFormData }) => updateInformasi(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: informasiKeys.all }),
    })
}

export function useDeleteInformasi() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => deleteInformasi(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: informasiKeys.all }),
    })
}
