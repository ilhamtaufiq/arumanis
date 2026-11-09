import api from '@/lib/api-client'
import type { ApiKeyListResponse, CreateApiKeyInput, CreatedApiKey } from '../types'

export const getApiKeys = async () => {
    return api.get<ApiKeyListResponse>('/admin/api-keys')
}

export const createApiKey = async (data: CreateApiKeyInput) => {
    return api.post<CreatedApiKey>('/admin/api-keys', data)
}

export const revokeApiKey = async (id: number) => {
    await api.post(`/admin/api-keys/${id}/revoke`)
}
