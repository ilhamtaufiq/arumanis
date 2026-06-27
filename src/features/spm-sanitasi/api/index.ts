import api from '@/lib/api-client'
import type {
    SpmDesaIntegration,
    SpmIntegrationResponse,
    SpmMckPekerjaan,
    SpmSanitasi,
    SpmSanitasiCapaianResponse,
    SpmSanitasiFilters,
    SpmSanitasiFormData,
    SpmSanitasiJenis,
    SpmSanitasiResponse,
    SpmSanitasiStats,
    SpmSanitasiSyncStatus,
} from '../types'

export const getSpmSanitasiList = async (params?: SpmSanitasiFilters) => {
    return api.get<SpmSanitasiResponse>('/spm-sanitasi', {
        params: { ...params, _t: Date.now() },
    })
}

export const getSpmSanitasiStats = async (params?: { kecamatan_id?: number; jenis?: SpmSanitasiJenis }) => {
    return api.get<{ success: boolean; data: SpmSanitasiStats }>('/spm-sanitasi/stats', {
        params: { ...params, _t: Date.now() },
    })
}

export const getSpmSanitasiCapaian = async (params?: {
    kecamatan_id?: number
    jenis?: SpmSanitasiJenis
    search?: string
    page?: number
    per_page?: number
    sort?: string
    direction?: 'asc' | 'desc'
}) => {
    return api.get<SpmSanitasiCapaianResponse>('/spm-sanitasi/capaian', {
        params: { ...params, _t: Date.now() },
    })
}

export const getSpmSanitasiById = async (id: number) => {
    return api.get<{ success: boolean; data: SpmSanitasi }>(`/spm-sanitasi/${id}`)
}

export const createSpmSanitasi = async (data: SpmSanitasiFormData) => {
    return api.post<{ success: boolean; data: SpmSanitasi; message: string }>('/spm-sanitasi', data)
}

export const updateSpmSanitasi = async (id: number, data: Partial<SpmSanitasiFormData>) => {
    return api.put<{ success: boolean; data: SpmSanitasi; message: string }>(`/spm-sanitasi/${id}`, data)
}

export const deleteSpmSanitasi = async (id: number) => {
    return api.delete<{ success: boolean; message: string }>(`/spm-sanitasi/${id}`)
}

export const importSpmSanitasi = async (file: File, replace = false) => {
    const formData = new FormData()
    formData.append('file', file)
    if (replace) {
        formData.append('replace', '1')
    }
    return api.post<{
        success: boolean
        message: string
        imported_rows: number
        skipped_rows: number
        errors: string[]
    }>('/spm-sanitasi/import', formData)
}

const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
}

export const downloadSpmSanitasiTemplate = async () => {
    const blob = await api.get<Blob>('/spm-sanitasi/import/template', { responseType: 'blob' })
    downloadBlob(blob, 'template_spm_sanitasi.xlsx')
}

export const getSpmSanitasiIntegration = async (params?: {
    page?: number
    per_page?: number
    tahun?: string
    kecamatan_id?: number
    desa_id?: number
    search?: string
    sync_status?: SpmSanitasiSyncStatus
    output_type?: string
}) => {
    return api.get<SpmIntegrationResponse>('/spm-sanitasi/integration', {
        params: { ...params, _t: Date.now() },
    })
}

export const getSpmSanitasiIntegrationByDesa = async (
    desaId: number,
    params?: { tahun?: string; output_type?: string }
) => {
    return api.get<{ success: boolean; data: SpmDesaIntegration }>(
        `/spm-sanitasi/integration/desa/${desaId}`,
        { params: { ...params, _t: Date.now() } }
    )
}

export const getSpmMckPekerjaan = async (params?: {
    page?: number
    per_page?: number
    tahun?: string
    kecamatan_id?: number
    desa_id?: number
    search?: string
    mck_type?: string
    output_type?: string
    spm_sanitasi_id?: number
    unlinked_only?: boolean
}) => {
    return api.get<{
        success: boolean
        data: SpmMckPekerjaan[]
        meta: SpmIntegrationResponse['meta']
    }>('/spm-sanitasi/mck-pekerjaan', {
        params: {
            ...params,
            unlinked_only: params?.unlinked_only ? 1 : undefined,
            _t: Date.now(),
        },
    })
}

export const attachSpmPekerjaan = async (
    spmSanitasiId: number,
    data: { pekerjaan_id: number; output_id?: number }
) => {
    return api.post<{ success: boolean; message: string; data: SpmSanitasi }>(
        `/spm-sanitasi/${spmSanitasiId}/pekerjaan`,
        data
    )
}

export const detachSpmPekerjaan = async (spmSanitasiId: number, pekerjaanId: number) => {
    return api.delete<{ success: boolean; message: string }>(
        `/spm-sanitasi/${spmSanitasiId}/pekerjaan/${pekerjaanId}`
    )
}

export const exportSpmSanitasi = async (params?: {
    kecamatan_id?: number
    desa_id?: number
    search?: string
}) => {
    const blob = await api.get<Blob>('/spm-sanitasi/export', {
        params,
        responseType: 'blob',
    })
    downloadBlob(blob, 'data_spm_sanitasi.xlsx')
}