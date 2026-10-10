import type { FeatureCollection } from 'geojson'
import api from '@/lib/api-client'

export type PeripaanItem = {
    id: number
    nama: string
    pekerjaan_id: number | null
    /** Hanya terisi di `getPeripaan` (detail) dan respons unggah; daftar tidak memuatnya. */
    geojson: FeatureCollection | null
    file_url: string | null
    file_name: string | null
    size: number | null
    media_id: number | null
    pekerjaan: { id: number; nama_paket: string } | null
    uploader: { id: number; name: string } | null
    created_at: string
}

export const getPeripaanList = async (params?: { pekerjaan_id?: number }) => {
    const response = await api.get<{ data: PeripaanItem[] }>('/peripaan', {
        params: { per_page: -1, pekerjaan_id: params?.pekerjaan_id },
    })
    return response.data
}

/** Satu berkas beserta GeoJSON-nya. */
export const getPeripaan = async (id: number) => {
    const response = await api.get<{ data: PeripaanItem }>(`/peripaan/${id}`)
    return response.data
}

/** Unggah berkas KML/KMZ. GeoJSON dibuat di server dari berkas itu. */
export const createPeripaan = async (data: { file: File; nama: string; pekerjaan_id?: number | null }) => {
    const formData = new FormData()
    formData.append('file', data.file)
    formData.append('nama', data.nama)
    if (data.pekerjaan_id) formData.append('pekerjaan_id', String(data.pekerjaan_id))
    return (await api.post<{ data: PeripaanItem }>('/peripaan', formData)).data
}

export const deletePeripaan = async (id: number) => {
    return api.delete(`/peripaan/${id}`)
}
