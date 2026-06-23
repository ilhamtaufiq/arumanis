import { useQuery } from '@tanstack/react-query'
import { getSpamIntegration, getSpamIntegrationByDesa } from '../api'
import type { SpamIntegrationFilters } from '../types'

export const spamIntegrationKeys = {
    all: ['spam-integration'] as const,
    lists: () => [...spamIntegrationKeys.all, 'list'] as const,
    list: (params: SpamIntegrationFilters) => [...spamIntegrationKeys.all, 'list', params] as const,
    detail: (desaId: number, tahun?: string) =>
        [...spamIntegrationKeys.all, 'detail', desaId, tahun] as const,
}

export function useSpamIntegration(params: SpamIntegrationFilters = {}, enabled = true) {
    return useQuery({
        queryKey: spamIntegrationKeys.list(params),
        queryFn: () => getSpamIntegration(params),
        enabled,
        staleTime: 0,
    })
}

export function useSpamIntegrationByDesa(desaId: number, tahun?: string, enabled = true) {
    return useQuery({
        queryKey: spamIntegrationKeys.detail(desaId, tahun),
        queryFn: () => getSpamIntegrationByDesa(desaId, { tahun }),
        enabled: enabled && desaId > 0,
        staleTime: 0,
    })
}