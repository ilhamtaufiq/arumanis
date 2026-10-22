import api from '@/lib/api-client'
import type { Surat, SuratFormData, SuratJenis, SuratJenisBaru, SuratListResponse, SuratPratinjau } from '../types'

export interface SuratListParams {
    tahun: number
    search?: string
    page?: number
    per_page?: number
    pekerjaan_id?: number
}

export const getSuratList = (params: SuratListParams) =>
    api.get<SuratListResponse>('/surat', { params: params as Record<string, string | number | undefined> })

/** Menambah jenis surat baru dari halaman surat. Hanya membuat; ubah dan hapus jenis tidak lewat sini. */
export const createSuratJenis = (data: SuratJenisBaru) => api.post<{ data: SuratJenis }>('/surat/jenis', data)

export const getSurat = (id: number) => api.get<{ data: Surat }>(`/surat/${id}`)

export const createSurat = (data: SuratFormData) => api.post<{ data: Surat }>('/surat', data)

export const updateSurat = (id: number, data: SuratFormData) => api.put<{ data: Surat }>(`/surat/${id}`, data)

export const deleteSurat = async (id: number) => {
    await api.delete(`/surat/${id}`)
}

export const getSuratPratinjau = (params: { tahun: number; type_id: number; tanggal: string }) =>
    api.get<{ data: SuratPratinjau }>('/surat/pratinjau', {
        params: params as Record<string, string | number | undefined>,
    })
