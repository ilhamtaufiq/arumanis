import api from '@/lib/api-client'
import type { MasterDesa } from '@/features/sipd-renja/lib/lokasi-wilayah'

type DesaApiItem = {
    id: number
    nama_desa: string
    kecamatan?: { nama_kecamatan: string } | null
}

/**
 * Seluruh master desa beserta kecamatannya, untuk mencocokkan lokasi SIPD.
 * Backend memakai per_page dari query; nilai -1 tidak valid dan akan jatuh ke default 15.
 */
export async function getMasterDesaUntukSipd(): Promise<MasterDesa[]> {
    const res = await api.get<{ data: DesaApiItem[] }>('/desa', { params: { per_page: 1000 } })
    return (res.data ?? []).map((d) => ({
        id: d.id,
        nama: d.nama_desa,
        kecamatan: d.kecamatan?.nama_kecamatan ?? null,
    }))
}
