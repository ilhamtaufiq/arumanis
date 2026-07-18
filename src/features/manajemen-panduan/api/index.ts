import api from '@/lib/api-client'
import type { PanduanPage, PanduanPageInput } from '../types'

type ListResponse = { data: PanduanPage[] }
type ItemResponse = { data: PanduanPage } | PanduanPage

function unwrapItem(res: ItemResponse): PanduanPage {
    if (res && typeof res === 'object' && 'data' in res && res.data) {
        return res.data as PanduanPage
    }
    return res as PanduanPage
}

/** Admin list */
export async function fetchAdminPanduan(params?: {
    search?: string
    section?: string
    published?: boolean
}): Promise<PanduanPage[]> {
    const res = await api.get<ListResponse>('/admin/panduan', { params })
    return res.data ?? []
}

export async function fetchAdminPanduanById(id: number): Promise<PanduanPage> {
    const res = await api.get<ItemResponse>(`/admin/panduan/${id}`)
    return unwrapItem(res)
}

export async function createPanduan(input: PanduanPageInput): Promise<PanduanPage> {
    const res = await api.post<ItemResponse>('/admin/panduan', input)
    return unwrapItem(res)
}

export async function updatePanduan(id: number, input: Partial<PanduanPageInput>): Promise<PanduanPage> {
    const res = await api.put<ItemResponse>(`/admin/panduan/${id}`, input)
    return unwrapItem(res)
}

export async function deletePanduan(id: number): Promise<void> {
    await api.delete(`/admin/panduan/${id}`)
}

export async function seedPanduanDefaults(force = false): Promise<{ message: string; created: number; skipped: number }> {
    return api.post('/admin/panduan/seed', { force })
}

/** Public (published) — used by docs site */
export async function fetchPublicPanduanSummary(): Promise<
    Array<Pick<PanduanPage, 'id' | 'slug' | 'title' | 'description' | 'section' | 'sort_order' | 'updated_at'>>
> {
    const res = await api.get<{ data: PanduanPage[] }>('/panduan', {
        params: { summary: 1 },
    })
    return res.data ?? []
}

export async function fetchPublicPanduanBySlug(slug: string): Promise<PanduanPage> {
    const res = await api.get<ItemResponse>(`/panduan/${slug}`)
    return unwrapItem(res)
}
