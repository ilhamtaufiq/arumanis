import api from '@/lib/api-client'

export type PuspenSharedFile = {
    id: string
    name: string
    fileName: string
    mimeType: string
    size: number
    url: string
    previewUrl: string
    folderPath: string | null
}

export type PuspenMediaShare = {
    id: string
    title: string
    description: string | null
    shareToken: string
    isPublic: boolean
    expiresAt: string | null
    downloadCount: number
    lastDownloadedAt: string | null
    files: PuspenSharedFile[]
    file: PuspenSharedFile | null
    downloadUrl: string
    publicUrl: string
    createdAt: string | null
    updatedAt: string | null
}

export type PuspenMediaLibraryItem = {
    id: string
    name: string
    fileName: string
    mimeType: string
    size: number
    url: string | null
    collectionName: string
    modelType: string
    createdAt: string | null
}

type PuspenSharedFileApi = {
    id: string | number
    name: string
    file_name: string
    mime_type: string
    size: number
    url: string
    preview_url?: string
    folder_path?: string | null
}

type PuspenMediaShareApi = {
    id: string | number
    title: string
    description: string | null
    share_token: string
    is_public: boolean
    expires_at: string | null
    download_count: number
    last_downloaded_at: string | null
    files?: PuspenSharedFileApi[]
    file: PuspenSharedFileApi | null
    download_url: string
    created_at: string | null
    updated_at: string | null
}

type PuspenMediaLibraryApi = {
    id: string | number
    name: string
    file_name: string
    mime_type: string
    size: number
    url?: string | null
    collection_name: string
    model_type: string
    created_at: string | null
}

const getPublicShareUrl = (token: string) => `${window.location.origin}/puspen/media-sharing/${token}`

const mapFile = (file: PuspenSharedFileApi): PuspenSharedFile => ({
    id: String(file.id),
    name: file.name,
    fileName: file.file_name,
    mimeType: file.mime_type,
    size: file.size,
    url: file.url,
    previewUrl: file.preview_url ?? file.url,
    folderPath: file.folder_path ?? null,
})

const mapShare = (item: PuspenMediaShareApi): PuspenMediaShare => ({
    id: String(item.id),
    title: item.title,
    description: item.description,
    shareToken: item.share_token,
    isPublic: item.is_public,
    expiresAt: item.expires_at,
    downloadCount: item.download_count,
    lastDownloadedAt: item.last_downloaded_at,
    files: Array.isArray(item.files) ? item.files.map(mapFile) : (item.file ? [mapFile(item.file)] : []),
    file: item.file ? mapFile(item.file) : null,
    downloadUrl: item.download_url,
    publicUrl: getPublicShareUrl(item.share_token),
    createdAt: item.created_at,
    updatedAt: item.updated_at,
})

const mapLibraryItem = (item: PuspenMediaLibraryApi): PuspenMediaLibraryItem => ({
    id: String(item.id),
    name: item.name,
    fileName: item.file_name,
    mimeType: item.mime_type,
    size: item.size,
    url: item.url ?? null,
    collectionName: item.collection_name,
    modelType: item.model_type,
    createdAt: item.created_at,
})

export async function getPuspenMediaShares(params?: { search?: string }): Promise<PuspenMediaShare[]> {
    const response = await api.get<{ data: PuspenMediaShareApi[] }>('/puspen/media-shares', {
        params,
    })

    return Array.isArray(response.data) ? response.data.map(mapShare) : []
}

export async function getPuspenMediaLibrary(params?: {
    search?: string
    mime_group?: 'all' | 'image' | 'video' | 'document'
    limit?: number
}): Promise<PuspenMediaLibraryItem[]> {
    const response = await api.get<{ data: PuspenMediaLibraryApi[] }>('/puspen/media-library', {
        params,
    })

    return Array.isArray(response.data) ? response.data.map(mapLibraryItem) : []
}

export async function createPuspenMediaShare(data: {
    title: string
    description?: string
    files?: File[]
    fileFolders?: string[]
    mediaIds?: string[]
    mediaFolders?: string[]
    isPublic?: boolean
    expiresAt?: string
}): Promise<PuspenMediaShare> {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('is_public', data.isPublic === false ? '0' : '1')

    if (data.description?.trim()) {
        formData.append('description', data.description.trim())
    }

    if (data.expiresAt) {
        formData.append('expires_at', data.expiresAt)
    }

    if (data.files?.length) {
        data.files.forEach((file, index) => {
            formData.append('files[]', file)
            formData.append('file_folders[]', data.fileFolders?.[index] ?? '')
        })
    } else if (data.mediaIds?.length) {
        data.mediaIds.forEach((mediaId, index) => {
            formData.append('media_ids[]', mediaId)
            formData.append('media_folders[]', data.mediaFolders?.[index] ?? '')
        })
    }

    const response = await api.post<{ data: PuspenMediaShareApi }>('/puspen/media-shares', formData)
    return mapShare(response.data)
}

export async function updatePuspenMediaShare(
    id: string,
    data: {
        title: string
        description?: string
        files?: File[]
        fileFolders?: string[]
        mediaIds?: string[]
        mediaFolders?: string[]
        isPublic?: boolean
        expiresAt?: string
    }
): Promise<PuspenMediaShare> {
    const formData = new FormData()
    formData.append('_method', 'PUT')
    formData.append('title', data.title)
    formData.append('is_public', data.isPublic === false ? '0' : '1')
    formData.append('description', data.description?.trim() ?? '')

    if (data.expiresAt) {
        formData.append('expires_at', data.expiresAt)
    }

    if (data.files?.length) {
        data.files.forEach((file, index) => {
            formData.append('files[]', file)
            formData.append('file_folders[]', data.fileFolders?.[index] ?? '')
        })
    } else if (data.mediaIds?.length) {
        data.mediaIds.forEach((mediaId, index) => {
            formData.append('media_ids[]', mediaId)
            formData.append('media_folders[]', data.mediaFolders?.[index] ?? '')
        })
    }

    const response = await api.post<{ data: PuspenMediaShareApi }>(`/puspen/media-shares/${id}`, formData)
    return mapShare(response.data)
}

export async function deletePuspenMediaShare(id: string): Promise<void> {
    await api.delete(`/puspen/media-shares/${id}`)
}

export async function getPublicPuspenMediaShare(token: string): Promise<PuspenMediaShare> {
    const response = await api.get<{ data: PuspenMediaShareApi }>(`/public/puspen/media-shares/${token}`)
    return mapShare(response.data)
}

export async function createPuspenMediaShareFromPekerjaanBerkas(
    pekerjaanId: number,
    data?: {
        berkasIds?: number[]
        title?: string
        description?: string
    },
): Promise<PuspenMediaShare> {
    const response = await api.post<{ data: PuspenMediaShareApi }>(
        `/pekerjaan/${pekerjaanId}/berkas/quick-share`,
        {
            berkas_ids: data?.berkasIds,
            title: data?.title,
            description: data?.description,
        },
    )

    return mapShare(response.data)
}
