import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    createPekerjaan,
    deletePekerjaan,
    getPekerjaan,
    getPekerjaanById,
    updatePekerjaan,
} from '../api/pekerjaan'
import type { Pekerjaan } from '../types'

export type PekerjaanListParams = {
    page?: number
    kecamatan_id?: number
    desa_id?: number
    kegiatan_id?: number
    tag_id?: number
    pengawas_id?: number
    search?: string
    tahun?: string
    per_page?: number
    sort_by?: string
    sort_direction?: 'asc' | 'desc'
}

export const pekerjaanKeys = {
    all: ['pekerjaan'] as const,
    lists: () => [...pekerjaanKeys.all, 'list'] as const,
    list: (params: PekerjaanListParams) => [...pekerjaanKeys.lists(), params] as const,
    details: () => [...pekerjaanKeys.all, 'detail'] as const,
    detail: (id: number) => [...pekerjaanKeys.details(), id] as const,
}

export function usePekerjaanList(params: PekerjaanListParams, enabled = true) {
    return useQuery({
        queryKey: pekerjaanKeys.list(params),
        queryFn: () => getPekerjaan(params),
        enabled,
    })
}

export function usePekerjaanDetail(id: number, enabled = true) {
    return useQuery({
        queryKey: pekerjaanKeys.detail(id),
        queryFn: () => getPekerjaanById(id),
        enabled: enabled && id > 0,
    })
}

type UpdatePekerjaanInput = {
    id: number
    data: Partial<Omit<Pekerjaan, 'id' | 'created_at' | 'updated_at' | 'kecamatan' | 'desa' | 'kegiatan'>>
}

export function useCreatePekerjaan() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: Omit<Pekerjaan, 'id' | 'created_at' | 'updated_at' | 'kecamatan' | 'desa' | 'kegiatan'>) =>
            createPekerjaan(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pekerjaanKeys.all })
            toast.success('Pekerjaan berhasil dibuat')
        },
        onError: () => toast.error('Gagal membuat pekerjaan'),
    })
}

export function useUpdatePekerjaan(options?: { onSettled?: () => void }) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: UpdatePekerjaanInput) => updatePekerjaan(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pekerjaanKeys.all })
            toast.success('Data berhasil diperbarui')
        },
        onError: () => toast.error('Gagal memperbarui data'),
        onSettled: options?.onSettled,
    })
}

export function useDeletePekerjaan() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => deletePekerjaan(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: pekerjaanKeys.all })
            toast.success('Pekerjaan berhasil dihapus')
        },
        onError: () => toast.error('Gagal menghapus pekerjaan'),
    })
}

export function useBulkDeletePekerjaan() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (ids: number[]) => {
            await Promise.all(ids.map((id) => deletePekerjaan(id)))
        },
        onSuccess: (_, ids) => {
            queryClient.invalidateQueries({ queryKey: pekerjaanKeys.all })
            toast.success(`${ids.length} pekerjaan berhasil dihapus`)
        },
        onError: () => toast.error('Gagal menghapus pekerjaan yang dipilih'),
    })
}