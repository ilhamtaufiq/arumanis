import api from '@/lib/api-client'

export interface PostLapangan {
    id: number
    pekerjaan_id: number
    nama_paket: string | null
    caption: string | null
    koordinat: string | null
    foto_url: string | null
    user_id: number | null
    user_name: string | null
    created_at: string | null
}

export interface PostLapanganResponse {
    data: PostLapangan[]
    meta: { current_page: number; last_page: number; per_page: number; total: number }
}

export const getPostLapangan = async (params: { page?: number; per_page?: number; tahun?: string }) => {
    return api.get<PostLapanganResponse>('/lapangan-post', { params: params as Record<string, string | number | undefined> })
}

export const createPostLapangan = async (data: FormData) => {
    return api.post<{ data: PostLapangan }>('/lapangan-post', data)
}

export const deletePostLapangan = async (id: number) => {
    return api.delete<{ message: string }>(`/lapangan-post/${id}`)
}
