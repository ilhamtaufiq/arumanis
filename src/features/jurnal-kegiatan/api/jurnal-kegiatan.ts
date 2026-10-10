import api from '@/lib/api-client'
import type { JurnalEntry, JurnalListResponse, JurnalParams, JurnalPayload } from '../types'

export const getJurnalList = async (params: JurnalParams) => {
    return api.get<JurnalListResponse>('/skp/jurnal', {
        params: { tahun: params.tahun, bulan: params.bulan },
    })
}

export const createJurnal = async (payload: JurnalPayload) => {
    return api.post<{ data: JurnalEntry }>('/skp/jurnal', payload)
}

export const updateJurnal = async (id: number, payload: JurnalPayload) => {
    return api.put<{ data: JurnalEntry }>(`/skp/jurnal/${id}`, payload)
}

export const deleteJurnal = async (id: number) => {
    await api.delete<void>(`/skp/jurnal/${id}`)
}
