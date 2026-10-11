import api from '@/lib/api-client'
import type {
    JurnalEntry,
    JurnalExportParams,
    JurnalListResponse,
    JurnalParams,
    JurnalPayload,
    JurnalRhk,
    JurnalRhkListResponse,
} from '../types'

export const getJurnalList = async (params: JurnalParams) => {
    return api.get<JurnalListResponse>('/skp/jurnal', {
        params: { tahun: params.tahun, bulan: params.bulan },
    })
}

export const createJurnal = async (payload: JurnalPayload) => {
    return api.post<{ data: JurnalEntry }>('/skp/jurnal', payload)
}

export const updateJurnal = async (id: number, payload: JurnalPayload) => {
    return api.put<{ data: JurnalEntry }>(`/skp/jurnal/${id}`, payload)
}

export const deleteJurnal = async (id: number) => {
    await api.delete<void>(`/skp/jurnal/${id}`)
}

/** Unggah foto dalam multipart (key "foto[]"). Content-Type diatur browser lewat api-client. */
export const uploadJurnalFoto = async (id: number, files: File[]) => {
    const body = new FormData()
    files.forEach((file) => body.append('foto[]', file))
    return api.post<{ data: JurnalEntry }>(`/skp/jurnal/${id}/foto`, body)
}

export const deleteJurnalFoto = async (id: number, mediaId: number) => {
    return api.delete<{ data: JurnalEntry }>(`/skp/jurnal/${id}/foto/${mediaId}`)
}

export const getJurnalRhk = async (tahun: number) => {
    return api.get<JurnalRhkListResponse>('/skp/rhk', { params: { tahun } })
}

export const saveJurnalRhk = async (tahun: number, items: JurnalRhk[]) => {
    return api.put<JurnalRhkListResponse>('/skp/rhk', { items }, { params: { tahun } })
}

/** Unduh berkas PPTX laporan. Mengembalikan Blob dan header Content-Disposition. */
export const exportJurnalPptx = async (params: JurnalExportParams) => {
    const meta: { disposition: string | null } = { disposition: null }
    const blob = await api.get<Blob>('/skp/laporan.pptx', {
        params: {
            tahun: params.tahun,
            bulan: params.bulan,
            feedback: params.feedback,
            strategi: params.strategi,
        },
        responseType: 'blob',
        onResponse: (response) => {
            meta.disposition = response.headers.get('content-disposition')
        },
    })
    return { blob, disposition: meta.disposition }
}
