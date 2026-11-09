import api from '@/lib/api-client'
import type { ApiKeyListResponse, ApiKeyScope, CreateApiKeyInput, CreatedApiKey } from '../types'

export const getApiKeys = async () => {
    return api.get<ApiKeyListResponse>('/admin/api-keys')
}

export const createApiKey = async (data: CreateApiKeyInput) => {
    return api.post<CreatedApiKey>('/admin/api-keys', data)
}

export const revokeApiKey = async (id: number) => {
    await api.post(`/admin/api-keys/${id}/revoke`)
}

export const updateApiKeyScopes = async (id: number, scopes: ApiKeyScope[]) => {
    return api.patch<{ data: { id: number; scopes: ApiKeyScope[] } }>(`/admin/api-keys/${id}`, { scopes })
}
