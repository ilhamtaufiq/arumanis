import api from '@/lib/api-client'
import type { PengawasKpiPeranFilter } from '../lib/pengawas-kpi-peran'

export type PengawasKpiItem = {
    id: number
    nama: string
    nip: string | null
    jabatan: string | null
    roles?: string[]
    pekerjaan_count: number
    foto_count: number
    penerima_count: number
    output_count: number
    fisik_count: number
    score: number
    score_per_pekerjaan?: number
    rank: number
}

export type PengawasKpiPekerjaanItem = {
    id: number
    nama_paket: string
    kode_rekening: string | null
    foto_count: number
    penerima_count: number
    output_count: number
    fisik_count: number
    score: number
}

export type PengawasKpiResponse = {
    data: PengawasKpiItem[]
    meta: {
        current_page: number
        last_page: number
        per_page: number
        total: number
    }
    summary: {
        total_pengawas: number
        tahun: number
        peran: PengawasKpiPeranFilter | null
    }
}

export type PengawasKpiDetailResponse = {
    user: {
        id: number
        nama: string
        nip: string | null
    }
    tahun: number
    pekerjaan: PengawasKpiPekerjaanItem[]
    summary: {
        pekerjaan_count: number
        foto_count: number
        penerima_count: number
        output_count: number
        fisik_count: number
        score: number
        score_per_pekerjaan: number
    }
}

export async function getPuspenPengawasKpi(params: {
    tahun?: number
    search?: string
    peran?: PengawasKpiPeranFilter
    page?: number
    per_page?: number
}): Promise<PengawasKpiResponse> {
    const response = await api.get<PengawasKpiResponse>('/puspen/pengawas-kpi', {
        params,
    })
    return response
}

export async function getPuspenPengawasKpiDetail(
    userId: number,
    params: { tahun?: number },
): Promise<PengawasKpiDetailResponse> {
    const response = await api.get<PengawasKpiDetailResponse>(`/puspen/pengawas-kpi/${userId}`, {
        params,
    })
    return response
}