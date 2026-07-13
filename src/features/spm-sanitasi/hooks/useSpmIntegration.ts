import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getSpmSanitasiIntegration, getSpmSanitasiIntegrationByDesa } from '../api'
import type { SpmSanitasiOutputType, SpmSanitasiSyncStatus } from '../types'

export type SpmIntegrationFilters = {
    page?: number
    per_page?: number
    tahun?: string
    kecamatan_id?: number
    desa_id?: number
    search?: string
    sync_status?: SpmSanitasiSyncStatus
    output_type?: SpmSanitasiOutputType | string
}

export const spmIntegrationKeys = {
    all: ['spm-sanitasi-integration'] as const,
    lists: () => [...spmIntegrationKeys.all, 'list'] as const,
    list: (params: SpmIntegrationFilters) => [...spmIntegrationKeys.lists(), params] as const,
    detail: (desaId: number, tahun?: string, outputType?: string) =>
        [...spmIntegrationKeys.all, 'detail', desaId, tahun, outputType] as const,
}

export function useSpmIntegration(params: SpmIntegrationFilters = {}, enabled = true) {
    return useQuery({
        queryKey: spmIntegrationKeys.list(params),
        queryFn: () => getSpmSanitasiIntegration(params),
        enabled,
        staleTime: 30_000,
        placeholderData: (previousData) => previousData,
    })
}

export function useSpmIntegrationByDesa(
    desaId: number,
    params?: { tahun?: string; output_type?: string },
    enabled = true
) {
    return useQuery({
        queryKey: spmIntegrationKeys.detail(desaId, params?.tahun, params?.output_type),
        queryFn: () => getSpmSanitasiIntegrationByDesa(desaId, params),
        enabled: enabled && desaId > 0,
        staleTime: 30_000,
        placeholderData: (previousData) => previousData,
    })
}

export function invalidateSpmIntegrationQueries(queryClient: ReturnType<typeof useQueryClient>) {
    queryClient.invalidateQueries({ queryKey: spmIntegrationKeys.all })
    queryClient.invalidateQueries({ queryKey: ['spm-sanitasi'] })
    queryClient.invalidateQueries({ queryKey: ['spm-sanitasi-stats'] })
    queryClient.invalidateQueries({ queryKey: ['spm-sanitasi-capaian'] })
    queryClient.invalidateQueries({ queryKey: ['spm-mck-pekerjaan'] })
    queryClient.invalidateQueries({ queryKey: ['spm-sanitasi-detail'] })
}