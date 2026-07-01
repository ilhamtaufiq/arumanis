import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    createMasterFasePekerjaan,
    deleteMasterFasePekerjaan,
    getMasterFasePekerjaan,
    updateMasterFasePekerjaan,
} from '../api/master-fase'
import type { MasterFasePekerjaan } from '../types/master-fase'

export const masterFaseKeys = {
    all: ['master-fase'] as const,
    list: (jenisProyek?: string) => [...masterFaseKeys.all, 'list', jenisProyek] as const,
}

export function useMasterFaseList(jenisProyek?: string, enabled = true) {
    return useQuery({
        queryKey: masterFaseKeys.list(jenisProyek),
        queryFn: () => getMasterFasePekerjaan(jenisProyek),
        enabled,
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
        mutationFn: ({ id, data }: { id: number; data: Partial<MasterFasePekerjaan> }) => updateMasterFasePekerjaan(id, data),
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