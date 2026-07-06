import { sipdClient } from '@/lib/sipd-client'
import type {
    SipdRenjaListResponse,
    SipdRincianResponse,
    SipdServiceStatus,
} from '@/features/sipd-renja/types'

export async function fetchSipdCachedRenja(params?: { tahun?: number; id_unit?: number }) {
    return sipdClient.get<SipdRenjaListResponse>('/renja', { params })
}

export async function fetchSipdCachedRincian(idSubBl: number) {
    return sipdClient.get<SipdRincianResponse>(`/rincian/${idSubBl}`)
}

export async function fetchSipdServiceStatus() {
    return sipdClient.get<SipdServiceStatus>('/status')
}