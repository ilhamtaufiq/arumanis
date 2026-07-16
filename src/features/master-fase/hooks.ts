import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    createMasterFasePekerjaan,
    deleteMasterFasePekerjaan,
    getMasterFasePekerjaan,
    reorderMasterFasePair,
    updateMasterFasePekerjaan,
} from './api'
import type { MasterFasePekerjaan } from './types'

export const masterFaseKeys = {
    all: ['master-fase'] as const,
    list: (jenisProyek?: string, activeOnly?: boolean) =>
        [...masterFaseKeys.all, 'list', jenisProyek ?? 'all', activeOnly ? 'active' : 'any'] as const,
}

export function useMasterFaseList(
    options?: { jenisProyek?: string; activeOnly?: boolean; enabled?: boolean },
) {
    const jenisProyek = options?.jenisProyek
    const activeOnly = options?.activeOnly
    return useQuery({
        queryKey: masterFaseKeys.list(jenisProyek, activeOnly),
        queryFn: () => getMasterFasePekerjaan({ jenisProyek, activeOnly }),
        enabled: options?.enabled !== false,
        staleTime: 60_000,
    })
}

export function useCreateMasterFase() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: Partial<MasterFasePekerjaan>) => createMasterFasePekerjaan(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: masterFaseKeys.all }),
    })
}

export function useUpdateMasterFase() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<MasterFasePekerjaan> }) =>
            updateMasterFasePekerjaan(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: masterFaseKeys.all }),
    })
}

export function useDeleteMasterFase() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteMasterFasePekerjaan,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: masterFaseKeys.all }),
    })
}

export function useReorderMasterFase() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            a,
            b,
        }: {
            a: { id: number; prioritas: number }
            b: { id: number; prioritas: number }
        }) => reorderMasterFasePair(a, b),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: masterFaseKeys.all }),
    })
}
