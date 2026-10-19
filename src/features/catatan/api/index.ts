import api from '@/lib/api-client'

export interface Catatan {
    id: number
    isi: string
    sumber: 'web' | 'whatsapp' | string
    user_id: number
    user_nama: string | null
    created_at: string | null
    updated_at: string | null
}

export interface CatatanListResponse {
    catatan: { data: Catatan[]; current_page: number; last_page: number; total: number }
    semua: boolean
}

export const CATATAN_KEY = ['catatan'] as const

export const getCatatan = (params: { q?: string; page?: number; semua?: boolean }) => {
    const query = new URLSearchParams()
    if (params.q) query.set('q', params.q)
    if (params.page) query.set('page', String(params.page))
    if (params.semua) query.set('semua', '1')
    return api.get<CatatanListResponse>(`/catatan?${query.toString()}`)
}

export const createCatatan = (isi: string) => api.post<{ id: number }>('/catatan', { isi })

export const updateCatatan = (id: number, isi: string) => api.put(`/catatan/${id}`, { isi })

export const deleteCatatan = (id: number) => api.delete(`/catatan/${id}`)
