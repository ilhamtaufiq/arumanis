import api from '@/lib/api-client'

export type OnlyOfficeEditorMode = 'edit' | 'view'

export type OnlyOfficeEditorConfig = {
    documentServerUrl: string
    config: Record<string, unknown>
    mode: OnlyOfficeEditorMode
    can_edit: boolean
    download_url?: string
    media: {
        id: number
        file_name: string
        mime_type: string | null
        extension?: string
    }
}

export type OnlyOfficeHealth = {
    enabled: boolean
    reachable: boolean
    document_server_url: string | null
    message: string
}

type OnlyOfficeConfigApiResponse = {
    data: OnlyOfficeEditorConfig
}

type OnlyOfficeHealthApiResponse = {
    data: OnlyOfficeHealth
}

export async function fetchOnlyOfficeConfig(
    mediaId: number,
    mode?: OnlyOfficeEditorMode,
): Promise<OnlyOfficeEditorConfig> {
    const response = await api.get<OnlyOfficeConfigApiResponse>(`/onlyoffice/media/${mediaId}/config`, {
        params: mode ? { mode } : undefined,
    })
    return {
        can_edit: false,
        ...response.data,
    }
}

export async function fetchOnlyOfficeHealth(): Promise<OnlyOfficeHealth> {
    try {
        const response = await api.get<OnlyOfficeHealthApiResponse>('/onlyoffice/health')
        return response.data
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Gagal memeriksa status ONLYOFFICE.'
        return {
            enabled: false,
            reachable: false,
            document_server_url: null,
            message,
        }
    }
}
