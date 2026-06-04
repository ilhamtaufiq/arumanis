import api from '@/lib/api-client'

export type ToolPdfItem = {
    id: string
    name: string
    originalFilename: string | null
    kind: 'source' | 'signed' | string
    parentId: string | null
    pdfUrl: string
    signaturePlacements?: ToolPdfSignaturePlacement[]
    createdAt: string | null
    updatedAt: string | null
}

export type ToolPdfSignaturePlacement = {
    id: string
    signatureId: string
    pageNumber: number
    xRatio: number
    yRatio: number
    scale: number
    sortOrder: number
    signatureName: string
    signatureFileName: string
    signatureMimeType: string
    signatureWidth: number
    signatureHeight: number
    signatureDataUrl: string | null
    signatureSourceType: 'upload' | 'library' | null
    signatureSourceId: string | null
}

type ToolPdfApiItem = {
    id: string | number
    name: string
    original_filename: string | null
    kind: 'source' | 'signed' | string
    parent_id: string | number | null
    pdf_url: string
    signature_placements?: Array<{
        id: string | number
        signature_id: string
        page_number: number
        x_ratio: number
        y_ratio: number
        scale: number
        sort_order: number
        signature_name: string
        signature_file_name: string
        signature_mime_type: string
        signature_width: number
        signature_height: number
        signature_data_url: string | null
        signature_source_type: 'upload' | 'library' | null
        signature_source_id: string | null
    }>
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
    signaturePlacements: Array.isArray(item.signature_placements)
        ? item.signature_placements.map((placement) => ({
            id: String(placement.id),
            signatureId: placement.signature_id,
            pageNumber: placement.page_number,
            xRatio: placement.x_ratio,
            yRatio: placement.y_ratio,
            scale: placement.scale,
            sortOrder: placement.sort_order,
            signatureName: placement.signature_name,
            signatureFileName: placement.signature_file_name,
            signatureMimeType: placement.signature_mime_type,
            signatureWidth: placement.signature_width,
            signatureHeight: placement.signature_height,
            signatureDataUrl: placement.signature_data_url ?? null,
            signatureSourceType: placement.signature_source_type,
            signatureSourceId: placement.signature_source_id,
        }))
        : undefined,
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
    options: { sourceId?: string | null; name?: string; placements?: Array<{
        signature_id: string
        page_number: number
        x_ratio: number
        y_ratio: number
        scale: number
        sort_order?: number
        signature_name: string
        signature_file_name: string
        signature_mime_type: string
        signature_width: number
        signature_height: number
        signature_data_url: string | null
        signature_source_type: 'upload' | 'library' | null
        signature_source_id: string | null
    }> }
): Promise<ToolPdfItem> {
    const formData = new FormData()
    formData.append('file', file)

    if (options.sourceId) {
        formData.append('source_id', options.sourceId)
    }

    if (options.name?.trim()) {
        formData.append('name', options.name.trim())
    }

    if (options.placements) {
        formData.append('placements', JSON.stringify(options.placements))
    }

    const response = await api.post<{ data: ToolPdfApiItem }>('/tool-pdfs/sign', formData)
    return mapToolPdfItem(response.data)
}

export async function downloadBulkToolPdfs(ids: string[]): Promise<Blob> {
    return await api.post<Blob>('/tool-pdfs/bulk-download', { ids }, {
        responseType: 'blob',
    })
}
