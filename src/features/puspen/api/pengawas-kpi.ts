import api from '@/lib/api-client'

export type PengawasKpiItem = {
    id: number
    nama: string
    nip: string | null
    jabatan: string | null
    pekerjaan_count: number
    foto_count: number
    penerima_count: number
    output_count: number
    // Progress Fisik — based on updates in the Laporan Progress Fisik tab (pekerjaan detail)
    fisik_count: number
    score: number
    rank: number
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
    }
}

export async function getPuspenPengawasKpi(params: {
    tahun?: number
    search?: string
    page?: number
    per_page?: number
}): Promise<PengawasKpiResponse> {
    const response = await api.get<PengawasKpiResponse>('/puspen/pengawas-kpi', {
        params,
    })
    return response
}
