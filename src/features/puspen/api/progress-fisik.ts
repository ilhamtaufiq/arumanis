import api from '@/lib/api-client'

export type PuspenProgressFisikItem = {
    kontrakId: number
    kodePaket: string | null
    namaPaket: string
    tahunAnggaran: number
    rencana: number | null
    realisasi: number | null
    deviasi: number | null
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
}

type PuspenProgressFisikApiItem = {
    kontrak_id: number
    kode_paket: string | null
    nama_paket: string
    tahun_anggaran: number
    rencana: number | null
    realisasi: number | null
    deviasi: number | null
}

const mapItem = (item: PuspenProgressFisikApiItem): PuspenProgressFisikItem => ({
    kontrakId: item.kontrak_id,
    kodePaket: item.kode_paket,
    namaPaket: item.nama_paket,
    tahunAnggaran: item.tahun_anggaran,
    rencana: item.rencana,
    realisasi: item.realisasi,
    deviasi: item.deviasi,
})

type ApiPaginatedResponse = {
    data: PuspenProgressFisikApiItem[]
    meta: PuspenProgressFisikResponse['meta']
}

const mapResponse = (response: ApiPaginatedResponse): PuspenProgressFisikResponse => ({
    data: Array.isArray(response.data) ? response.data.map(mapItem) : [],
    meta: response.meta,
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

export async function savePublicPuspenProgressFisik(data: {
    items: Array<{
        kontrak_id: number
        rencana: number | null
        realisasi: number | null
    }>
}): Promise<void> {
    await api.post('/public/puspen/progress-fisik/bulk-update', data)
}
