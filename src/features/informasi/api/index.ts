import api from '@/lib/api-client'
import type { Informasi, InformasiFormData, InformasiKategori, InformasiListResponse } from '../types'

export const getInformasiList = (params: { kategori?: InformasiKategori | undefined }) =>
    api.get<InformasiListResponse>('/informasi', {
        params: params.kategori ? { kategori: params.kategori } : undefined,
    })

export const createInformasi = (data: InformasiFormData) => api.post<{ data: Informasi }>('/informasi', data)

export const updateInformasi = (id: number, data: InformasiFormData) =>
    api.put<{ data: Informasi }>(`/informasi/${id}`, data)

export const deleteInformasi = async (id: number) => {
    await api.delete(`/informasi/${id}`)
}
