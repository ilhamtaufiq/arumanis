import { fetchAllPages } from '@/lib/paginated-fetch'
import { getAllKegiatan } from '@/features/kegiatan/api/kegiatan'
import { getPekerjaan } from '@/features/pekerjaan/api/pekerjaan'
import { getPenyedia } from '@/features/kontrak/api/kontrak'
import type { Sp2dKegiatanCatalog, Sp2dPekerjaanCatalog, Sp2dPenyediaCatalog } from '../types'

export async function loadSp2dPenyediaCatalog(): Promise<Sp2dPenyediaCatalog[]> {
    const res = await getPenyedia({ per_page: -1 })
    return (res.data ?? []).map((p) => ({
        id: p.id,
        nama: p.nama,
        direktur: p.direktur ?? null,
    }))
}

export async function loadSp2dKegiatanCatalog(tahun: string): Promise<Sp2dKegiatanCatalog[]> {
    const items = await getAllKegiatan(tahun)
    return items.map((k) => ({
        id: k.id,
        nama_sub_kegiatan: k.nama_sub_kegiatan,
        nama_kegiatan: k.nama_kegiatan,
        tahun_anggaran: String(k.tahun_anggaran ?? tahun),
    }))
}

export async function loadSp2dPekerjaanCatalog(tahun: string): Promise<Sp2dPekerjaanCatalog[]> {
    const items = await fetchAllPages((page) =>
        getPekerjaan({
            page,
            per_page: 100,
            tahun,
            status: 'active',
        }),
    )

    return items.map((p) => {
        const kontrak = (p.kontrak ?? []).map((k) => ({
            id: k.id,
            nilai_kontrak: k.nilai_kontrak ?? null,
            penyedia_id: k.penyedia?.id ?? null,
            penyedia_nama: k.penyedia?.nama ?? null,
        }))
        const penyediaIds = Array.from(
            new Set(
                kontrak
                    .map((k) => k.penyedia_id)
                    .filter((id): id is number => typeof id === 'number' && id > 0),
            ),
        )
        return {
            id: p.id,
            nama_paket: p.nama_paket,
            pagu: p.pagu ?? 0,
            status: p.status ?? 'active',
            kegiatan_id: p.kegiatan_id ?? p.kegiatan?.id ?? null,
            penyediaIds,
            kontrak,
        }
    })
}
