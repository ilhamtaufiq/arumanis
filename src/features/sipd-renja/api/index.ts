import { sipdClient } from '@/lib/sipd-client'
import type {
    SipdRenjaListResponse,
    SipdRincianResponse,
    SipdServiceStatus,
} from '@/features/sipd-renja/types'

/** 0 = Renja (perencanaan), 1 = Penganggaran — flag cache SIPD Web */
export const SIPD_IS_ANGGARAN_PENGANGGARAN = 1 as const

export async function fetchSipdCachedRenja(params?: {
    tahun?: number
    id_unit?: number
    /** Default: Penganggaran (`is_anggaran=1`) */
    is_anggaran?: number
}) {
    return sipdClient.get<SipdRenjaListResponse>('/renja', {
        params: {
            is_anggaran: params?.is_anggaran ?? SIPD_IS_ANGGARAN_PENGANGGARAN,
            tahun: params?.tahun,
            id_unit: params?.id_unit,
        },
    })
}

export async function fetchSipdCachedRincian(
    idSubBl: number,
    params?: { is_anggaran?: number },
) {
    return sipdClient.get<SipdRincianResponse>(`/rincian/${idSubBl}`, {
        params: {
            is_anggaran: params?.is_anggaran ?? SIPD_IS_ANGGARAN_PENGANGGARAN,
        },
    })
}

export async function fetchSipdServiceStatus() {
    return sipdClient.get<SipdServiceStatus>('/status')
}