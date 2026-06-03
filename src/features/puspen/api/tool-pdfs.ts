import api from '@/lib/api-client'

export type ToolPdfItem = {
    id: string
    name: string
    originalFilename: string | null
    kind: 'source' | 'signed' | string
    parentId: string | null
    pdfUrl: string
    createdAt: string | null
    updatedAt: string | null
}

type ToolPdfApiItem = {
    id: string | number
    name: string
    original_filename: string | null
    kind: 'source' | 'signed' | string
    parent_id: string | number | null
    pdf_url: string
    created_at: string | null
    updated_at: string | null
}

const mapToolPdfItem = (item: ToolPdfApiItem): ToolPdfItem => ({
    id: String(item.id),
    name: item.name,
    originalFilename: item.original_filename,
    kind: item.kind,
    parentId: item.parent_id !== null ? String(item.parent_id) : null,
    pdfUrl: item.pdf_url,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
})

export async function getToolPdfs(params?: { search?: string; kind?: string }): Promise<ToolPdfItem[]> {
    const response = await api.get<{ data: ToolPdfApiItem[] }>('/tool-pdfs', {
        params,
    })

    return Array.isArray(response.data) ? response.data.map(mapToolPdfItem) : []
}

export async function uploadToolPdf(file: File, name?: string): Promise<ToolPdfItem> {
    const formData = new FormData()
    formData.append('file', file)

    if (name?.trim()) {
        formData.append('name', name.trim())
    }

    const response = await api.post<{ data: ToolPdfApiItem }>('/tool-pdfs', formData)
    return mapToolPdfItem(response.data)
}

export async function deleteToolPdf(id: string): Promise<void> {
    await api.delete(`/tool-pdfs/${id}`)
}

export async function downloadToolPdfBlob(id: string): Promise<Blob> {
    return await api.get<Blob>(`/tool-pdfs/${id}/download`, {
        responseType: 'blob',
    })
}

export async function saveSignedToolPdf(
    file: File,
    options: { sourceId?: string | null; name?: string }
): Promise<ToolPdfItem> {
    const formData = new FormData()
    formData.append('file', file)

    if (options.sourceId) {
        formData.append('source_id', options.sourceId)
    }

    if (options.name?.trim()) {
        formData.append('name', options.name.trim())
    }

    const response = await api.post<{ data: ToolPdfApiItem }>('/tool-pdfs/sign', formData)
    return mapToolPdfItem(response.data)
}

export async function downloadBulkToolPdfs(ids: string[]): Promise<Blob> {
    return await api.post<Blob>('/tool-pdfs/bulk-download', { ids }, {
        responseType: 'blob',
    })
}
