import api, { ApiError } from '@/lib/api-client'

export type PaperlessSyncResponse = {
    message: string
    media_id: number
}

export type PaperlessSyncAllResponse = {
    message: string
    dispatched_count: number
}

export type PaperlessDocument = {
    id: number
    title?: string
    content?: string
    created?: string
    [key: string]: unknown
}

export type PaperlessSearchResponse = {
    count?: number
    results?: PaperlessDocument[]
    [key: string]: unknown
}

/** Antrekan sinkron satu media Spatie ke Paperless-ngx. */
export async function syncMediaToPaperless(mediaId: number): Promise<PaperlessSyncResponse> {
    const response = await api.post<PaperlessSyncResponse>(`/paperless/media/${mediaId}/sync`)
    return response
}

/** Antrekan sinkron massal (filter opsional model/collection). */
export async function syncAllMediaToPaperless(params?: {
    model_type?: string
    collection_name?: string
}): Promise<PaperlessSyncAllResponse> {
    const response = await api.post<PaperlessSyncAllResponse>('/paperless/sync-all', params ?? {})
    return response
}

export type PaperlessSyncedIdsResponse = {
    synced_ids: number[]
}

/** Batch status sinkron (1 request untuk banyak media — hindari N+1). */
export async function getPaperlessSyncedIds(mediaIds: number[]): Promise<number[]> {
    const clean = [...new Set(mediaIds.filter((id) => Number.isFinite(id) && id > 0))].slice(0, 500)
    if (clean.length === 0) return []
    const response = await api.post<PaperlessSyncedIdsResponse>('/paperless/synced-ids', {
        media_ids: clean,
    })
    return response.synced_ids ?? []
}

/**
 * Status dokumen Paperless untuk satu media.
 * Mengembalikan null bila media belum disinkron (backend 404) — bukan error.
 */
export async function getPaperlessStatus(mediaId: number): Promise<PaperlessDocument | null> {
    try {
        const response = await api.get<PaperlessDocument | { document?: PaperlessDocument }>(
            `/paperless/media/${mediaId}`,
        )
        if (response && typeof response === 'object' && 'document' in response) {
            return (response as { document?: PaperlessDocument }).document ?? null
        }
        return response as PaperlessDocument
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
            return null
        }
        throw error
    }
}

/** Cari dokumen di Paperless-ngx (full-text OCR). */
export async function searchPaperlessDocuments(query: string, page = 1): Promise<PaperlessSearchResponse> {
    const response = await api.get<PaperlessSearchResponse>('/paperless/documents', {
        params: { query, page },
    })
    return response
}

/** URL unduhan via BFF (dipakai sebagai href anchor, kredensial cookie ikut). */
export function paperlessDownloadUrl(mediaId: number): string {
    return `/bff/api/paperless/media/${mediaId}/download`
}
