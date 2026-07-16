import api from '@/lib/api-client'
import type { MasterFasePekerjaan } from './types'

export async function getMasterFasePekerjaan(params?: {
    jenisProyek?: string
    activeOnly?: boolean
}): Promise<MasterFasePekerjaan[]> {
    const q = new URLSearchParams()
    if (params?.jenisProyek) q.append('jenis_proyek', params.jenisProyek)
    if (params?.activeOnly) q.append('is_active', '1')

    const response = await api.get<{ success: boolean; data: MasterFasePekerjaan[] }>(
        `/master-fase-pekerjaan?${q.toString()}`,
    )
    return response.data
}

export async function createMasterFasePekerjaan(
    data: Partial<MasterFasePekerjaan>,
): Promise<MasterFasePekerjaan> {
    const response = await api.post<{ success: boolean; data: MasterFasePekerjaan }>(
        '/master-fase-pekerjaan',
        data,
    )
    return response.data
}

export async function updateMasterFasePekerjaan(
    id: number,
    data: Partial<MasterFasePekerjaan>,
): Promise<MasterFasePekerjaan> {
    const response = await api.put<{ success: boolean; data: MasterFasePekerjaan }>(
        `/master-fase-pekerjaan/${id}`,
        data,
    )
    return response.data
}

export async function deleteMasterFasePekerjaan(id: number): Promise<void> {
    await api.delete(`/master-fase-pekerjaan/${id}`)
}

/** Swap prioritas between two phases (local update both). */
export async function reorderMasterFasePair(
    a: { id: number; prioritas: number },
    b: { id: number; prioritas: number },
): Promise<void> {
    await Promise.all([
        updateMasterFasePekerjaan(a.id, { prioritas: b.prioritas }),
        updateMasterFasePekerjaan(b.id, { prioritas: a.prioritas }),
    ])
}
