import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createApiKey, getApiKeys, revokeApiKey } from '../api'
import type { CreateApiKeyInput } from '../types'

export const apiKeyKeys = {
    all: ['api-keys'] as const,
    list: () => [...apiKeyKeys.all, 'list'] as const,
}

export function useApiKeysList() {
    return useQuery({
        queryKey: apiKeyKeys.list(),
        queryFn: getApiKeys,
    })
}

export function useCreateApiKey() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (input: CreateApiKeyInput) => createApiKey(input),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: apiKeyKeys.all })
        },
        onError: (err: Error) => toast.error(err.message || 'Gagal membuat kunci API'),
    })
}

export function useRevokeApiKey() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => revokeApiKey(id),
        onSuccess: () => {
            toast.success('Kunci API dicabut')
            void queryClient.invalidateQueries({ queryKey: apiKeyKeys.all })
        },
        onError: (err: Error) => toast.error(err.message || 'Gagal mencabut kunci API'),
    })
}
