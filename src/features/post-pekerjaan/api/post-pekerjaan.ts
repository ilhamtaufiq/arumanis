import api from '@/lib/api-client'
import { toggleChecklist } from '@/features/checklist/api/checklist'
import type { PostPekerjaanParams, PostPekerjaanResponse } from '../types'

export async function getPostPekerjaanChecklist(params?: PostPekerjaanParams) {
    return api.get<PostPekerjaanResponse>('/post-pekerjaan-checklist', {
        params: params as Record<string, string | number | undefined>,
    })
}

export { toggleChecklist as togglePostPekerjaanChecklist }

/** Ekspor Excel post pekerjaan, dengan filter yang sama dengan daftar. */
export async function exportPostPekerjaanExcel(params?: PostPekerjaanParams) {
    return api.get<Blob>('/post-pekerjaan-checklist/export/excel', {
        params: params as Record<string, string | number | undefined>,
        responseType: 'blob',
    })
}

/** Ekspor PDF post pekerjaan, dengan filter yang sama dengan daftar. */
export async function exportPostPekerjaanPdf(params?: PostPekerjaanParams) {
    return api.get<Blob>('/post-pekerjaan-checklist/export/pdf', {
        params: params as Record<string, string | number | undefined>,
        responseType: 'blob',
    })
}
