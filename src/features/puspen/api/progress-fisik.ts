import api from '@/lib/api-client'

export type PuspenProgressFisikItem = {
    kontrakId: number
    kodePaket: string | null
    namaPaket: string
    subKegiatan: string | null
    tahunAnggaran: number
    rencana: number | null
    realisasi: number | null
    deviasi: number | null
    updatedAt: string | null
}

export type PuspenProgressFisikSummary = {
    count: number
    rencana: number
    realisasi: number
    deviasi: number
    latestUpdatedAt: string | null
    perSubKegiatan: Array<{
        subKegiatan: string
        count: number
        rencana: number
        realisasi: number
        deviasi: number
    }>
}

export type PuspenProgressFisikResponse = {
    data: PuspenProgressFisikItem[]
    meta: {
        current_page: number
        last_page: number
        per_page: number
        total: number
        from?: number | null
        to?: number | null
    }
    summary: PuspenProgressFisikSummary
}

type PuspenProgressFisikApiItem = {
    kontrak_id: number
    kode_paket: string | null
    nama_paket: string
    sub_kegiatan?: string | null
    tahun_anggaran: number
    rencana: number | null
    realisasi: number | null
    deviasi: number | null
    updated_at?: string | null
}

type PuspenProgressFisikApiSummary = {
    count?: number
    rencana?: number
    realisasi?: number
    deviasi?: number
    latest_updated_at?: string | null
    per_sub_kegiatan?: Array<{
        sub_kegiatan: string
        count: number
        rencana: number
        realisasi: number
        deviasi: number
    }>
}

const mapItem = (item: PuspenProgressFisikApiItem): PuspenProgressFisikItem => ({
    kontrakId: item.kontrak_id,
    kodePaket: item.kode_paket,
    namaPaket: item.nama_paket,
    subKegiatan: item.sub_kegiatan ?? null,
    tahunAnggaran: item.tahun_anggaran,
    rencana: item.rencana,
    realisasi: item.realisasi,
    deviasi: item.deviasi,
    updatedAt: item.updated_at ?? null,
})

const mapSummary = (summary?: PuspenProgressFisikApiSummary): PuspenProgressFisikSummary => ({
    count: summary?.count ?? 0,
    rencana: summary?.rencana ?? 0,
    realisasi: summary?.realisasi ?? 0,
    deviasi: summary?.deviasi ?? 0,
    latestUpdatedAt: summary?.latest_updated_at ?? null,
    perSubKegiatan: (summary?.per_sub_kegiatan ?? []).map((item) => ({
        subKegiatan: item.sub_kegiatan,
        count: item.count,
        rencana: item.rencana,
        realisasi: item.realisasi,
        deviasi: item.deviasi,
    })),
})

type ApiPaginatedResponse = {
    data: PuspenProgressFisikApiItem[]
    meta: PuspenProgressFisikResponse['meta']
    summary?: PuspenProgressFisikApiSummary
}

const mapResponse = (response: ApiPaginatedResponse): PuspenProgressFisikResponse => ({
    data: Array.isArray(response.data) ? response.data.map(mapItem) : [],
    meta: response.meta,
    summary: mapSummary(response.summary),
})

export async function getPuspenProgressFisik(params: {
    tahun: number
    search?: string
    page?: number
    per_page?: number
}): Promise<PuspenProgressFisikResponse> {
    const response = await api.get<ApiPaginatedResponse>('/puspen/progress-fisik', {
        params,
    })

    return mapResponse(response)
}

export async function getPublicPuspenProgressFisik(params?: {
    search?: string
    page?: number
    per_page?: number
}): Promise<PuspenProgressFisikResponse> {
    const response = await api.get<ApiPaginatedResponse>('/public/puspen/progress-fisik', {
        params,
    })

    return mapResponse(response)
}

export async function savePuspenProgressFisik(data: {
    tahun: number
    items: Array<{
        kontrak_id: number
        rencana: number | null
        realisasi: number | null
    }>
}): Promise<void> {
    await api.post('/puspen/progress-fisik/bulk-update', data)
}


