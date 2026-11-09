export type ApiKeyScope = 'spam-units:read' | 'peripaan:read' | 'pekerjaan:read'

export const API_KEY_SCOPES: { value: ApiKeyScope; label: string }[] = [
    { value: 'spam-units:read', label: 'Unit SPAM (baca)' },
    { value: 'peripaan:read', label: 'Peta perpipaan (baca)' },
    { value: 'pekerjaan:read', label: 'Paket pekerjaan (baca)' },
]

export type ApiKeyStatus = 'aktif' | 'dicabut' | 'kedaluwarsa'

export interface ApiKey {
    id: number
    name: string
    prefix: string
    scopes: ApiKeyScope[]
    status: ApiKeyStatus
    expires_at: string | null
    revoked_at: string | null
    last_used_at: string | null
}

export interface ApiKeyListResponse {
    data: ApiKey[]
}

export interface CreateApiKeyInput {
    name: string
    scopes: ApiKeyScope[]
    expires_days: number | null
}

export interface CreatedApiKey {
    id: number
    key: string
}
