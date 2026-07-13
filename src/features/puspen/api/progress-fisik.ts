import api from '@/lib/api-client'

export type PuspenProgressFisikOutput = {
    outputId: number
    pekerjaanId: number
    komponen: string
    volume: number
    satuan: string
    realisasi: number | null
    updatedAt: string | null
}

export type PuspenProgressFisikItem = {
    kontrakId: number
    kodePaket: string | null
    namaPaket: string
    subKegiatan: string | null
    tahunAnggaran: number
    pagu: number
    nilaiKontrak: number
    sisaKontrak: number
    retensi: number
    rencana: number | null
    realisasi: number | null
    deviasi: number | null
    phoCompleted: boolean
    updatedAt: string | null
    outputs: PuspenProgressFisikOutput[]
    hasOutputs: boolean
    outputNotice: string | null
}

export type PuspenProgressFisikKomponenOutputSummary = {
    komponen: string
    satuan: string
    outputCount: number
    volumeTarget: number
    volumeRealisasi: number
    capaian: number | null
}

export type PuspenProgressFisikSubKegiatanOutputSummary = {
    subKegiatan: string
    outputCount: number
    volumeTarget: number
    volumeRealisasi: number
    capaian: number | null
    komponen: PuspenProgressFisikKomponenOutputSummary[]
}

export type PuspenProgressFisikSummary = {
    count: number
    rencana: number
    realisasi: number
    deviasi: number
    latestUpdatedAt: string | null
    kontrakTanpaOutput: number
    phoCompleted: number
    perSubKegiatan: Array<{
        subKegiatan: string
        count: number
        rencana: number
        realisasi: number
        deviasi: number
    }>
    perSubKegiatanOutput: PuspenProgressFisikSubKegiatanOutputSummary[]
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

type PuspenProgressFisikApiOutput = {
    output_id: number
    pekerjaan_id: number
    komponen: string
    volume: number
    satuan: string
    realisasi: number | null
    updated_at?: string | null
}

type PuspenProgressFisikApiItem = {
    kontrak_id: number
    kode_paket: string | null
    nama_paket: string
    sub_kegiatan?: string | null
    tahun_anggaran: number
    pagu?: number | null
    nilai_kontrak?: number | null
    sisa_kontrak?: number | null
    retensi?: number | null
    rencana: number | null
    realisasi: number | null
    deviasi: number | null
    pho_completed?: boolean
    updated_at?: string | null
    outputs?: PuspenProgressFisikApiOutput[]
    has_outputs?: boolean
    output_notice?: string | null
}

type PuspenProgressFisikApiSummary = {
    count?: number
    rencana?: number
    realisasi?: number
    deviasi?: number
    latest_updated_at?: string | null
    kontrak_tanpa_output?: number
    pho_completed?: number
    per_sub_kegiatan?: Array<{
        sub_kegiatan: string
        count: number
        rencana: number
        realisasi: number
        deviasi: number
    }>
    per_sub_kegiatan_output?: Array<{
        sub_kegiatan: string
        output_count: number
        volume_target: number
        volume_realisasi: number
        capaian: number | null
        komponen?: Array<{
            komponen: string
            satuan: string
            output_count: number
            volume_target: number
            volume_realisasi: number
            capaian: number | null
        }>
    }>
}

const mapOutput = (item: PuspenProgressFisikApiOutput): PuspenProgressFisikOutput => ({
    outputId: item.output_id,
    pekerjaanId: item.pekerjaan_id,
    komponen: item.komponen,
    volume: item.volume,
    satuan: item.satuan,
    realisasi: item.realisasi,
    updatedAt: item.updated_at ?? null,
})

const mapItem = (item: PuspenProgressFisikApiItem): PuspenProgressFisikItem => {
    const pagu = Number(item.pagu ?? 0) || 0
    const nilaiKontrak = Number(item.nilai_kontrak ?? 0) || 0
    const sisaKontrak =
        item.sisa_kontrak != null
            ? Number(item.sisa_kontrak) || 0
            : Math.max(0, pagu - nilaiKontrak)
    const retensi =
        item.retensi != null
            ? Number(item.retensi) || 0
            : Number((nilaiKontrak * 0.05).toFixed(2))

    return {
        kontrakId: item.kontrak_id,
        kodePaket: item.kode_paket,
        namaPaket: item.nama_paket,
        subKegiatan: item.sub_kegiatan ?? null,
        tahunAnggaran: item.tahun_anggaran,
        pagu,
        nilaiKontrak,
        sisaKontrak,
        retensi,
        rencana: item.rencana,
        realisasi: item.realisasi,
        deviasi: item.deviasi,
        phoCompleted: item.pho_completed ?? false,
        updatedAt: item.updated_at ?? null,
        outputs: Array.isArray(item.outputs) ? item.outputs.map(mapOutput) : [],
        hasOutputs: item.has_outputs ?? (Array.isArray(item.outputs) && item.outputs.length > 0),
        outputNotice: item.output_notice ?? null,
    }
}

const mapSummary = (summary?: PuspenProgressFisikApiSummary): PuspenProgressFisikSummary => ({
    count: summary?.count ?? 0,
    rencana: summary?.rencana ?? 0,
    realisasi: summary?.realisasi ?? 0,
    deviasi: summary?.deviasi ?? 0,
    latestUpdatedAt: summary?.latest_updated_at ?? null,
    kontrakTanpaOutput: summary?.kontrak_tanpa_output ?? 0,
    phoCompleted: summary?.pho_completed ?? 0,
    perSubKegiatan: (summary?.per_sub_kegiatan ?? []).map((item) => ({
        subKegiatan: item.sub_kegiatan,
        count: item.count,
        rencana: item.rencana,
        realisasi: item.realisasi,
        deviasi: item.deviasi,
    })),
    perSubKegiatanOutput: (summary?.per_sub_kegiatan_output ?? []).map((item) => ({
        subKegiatan: item.sub_kegiatan,
        outputCount: item.output_count,
        volumeTarget: item.volume_target,
        volumeRealisasi: item.volume_realisasi,
        capaian: item.capaian,
        komponen: (item.komponen ?? []).map((row) => ({
            komponen: row.komponen,
            satuan: row.satuan,
            outputCount: row.output_count,
            volumeTarget: row.volume_target,
            volumeRealisasi: row.volume_realisasi,
            capaian: row.capaian,
        })),
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
    sub_kegiatan?: string
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
    sub_kegiatan?: string
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
        rencana?: number | null
        realisasi?: number | null
        pho_completed?: boolean
        outputs?: Array<{
            output_id: number
            realisasi: number | null
        }>
    }>
}): Promise<void> {
    await api.post('/puspen/progress-fisik/bulk-update', data)
}