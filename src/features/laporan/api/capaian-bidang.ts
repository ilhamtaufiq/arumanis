import api from '@/lib/api-client'

/** Capaian satu sub bidang (`air minum` atau `sanitasi`) dari `GET /dashboard/capaian-bidang`. */
export type CapaianBidang = {
    name: string
    kegiatan: number
    paguKegiatan: number
    paket: number
    berkontrak: number
    belumBerkontrak: number
    batal: number
    pagu: number
    progressFisik: number
    paketBerprogres: number
    sp2dTotal: number
    realisasiKeuanganPersen: number
}

export type CapaianBidangResponse = {
    tahun: string
    bidang: CapaianBidang[]
}

export const getCapaianBidang = async (tahun: string) => {
    const response = await api.get<{ data: CapaianBidangResponse }>('/dashboard/capaian-bidang', {
        params: { tahun },
    })
    return response.data
}
