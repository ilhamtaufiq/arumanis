import api from '@/lib/api-client'

export type SignatureLibraryItem = {
    id: string
    name: string
    dataUrl: string
    mimeType: string
    width: number
    height: number
    createdAt: string
}

type SignatureLibraryApiItem = {
    id: number
    name: string
    mime_type: string
    data_url: string
    width: number
    height: number
    created_at: string
}

type SignatureLibraryPayload = {
    name: string
    mimeType: string
    dataUrl: string
    width: number
    height: number
}

const mapSignatureLibraryItem = (item: SignatureLibraryApiItem): SignatureLibraryItem => ({
    id: String(item.id),
    name: item.name,
    dataUrl: item.data_url,
    mimeType: item.mime_type,
    width: item.width,
    height: item.height,
    createdAt: item.created_at,
})

export async function getSignatureLibraries(): Promise<SignatureLibraryItem[]> {
    const response = await api.get<{ success: boolean; data: SignatureLibraryApiItem[] }>('/signature-libraries')
    return Array.isArray(response.data) ? response.data.map(mapSignatureLibraryItem) : []
}

export async function saveSignatureLibrary(payload: SignatureLibraryPayload): Promise<SignatureLibraryItem> {
    const response = await api.post<{ success: boolean; data: SignatureLibraryApiItem }>('/signature-libraries', {
        name: payload.name,
        mime_type: payload.mimeType,
        data_url: payload.dataUrl,
        width: payload.width,
        height: payload.height,
    })

    return mapSignatureLibraryItem(response.data)
}

export async function deleteSignatureLibrary(id: string): Promise<void> {
    await api.delete(`/signature-libraries/${id}`)
}
