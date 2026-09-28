import type { SipdRincianRow } from '@/features/sipd-renja/types'
import type { Kegiatan } from '@/features/kegiatan/types'
import { normalizeSyncText } from '@/features/sipd-renja/lib/kegiatan-sync'

/** Query prefill /pekerjaan/new dari baris rincian SIPD. Semua string (search params). */
export interface BuatPaketSearch {
    sipd_nama_paket?: string
    sipd_kode_rekening?: string
    sipd_pagu?: string
    sipd_kode_sub_giat?: string
    sipd_nama_sub?: string
    sipd_id_sub_bl?: string
    sipd_id_rinci?: string
}

export interface SipdParentContext {
    idSubBl: number
    kodeSubGiat: string
    namaSubGiat: string
}

/** Nama paket default: Keterangan → uraian → SSH. */
export function defaultNamaPaket(row: SipdRincianRow): string {
    return (
        String(row.ket_bl_teks || '').trim() ||
        String(row.subs_bl_teks || '').trim() ||
        String(row.nama_standar_harga || '').trim()
    )
}

/** Pagu default: total sesudah perubahan → total sebelum. */
export function defaultPagu(row: SipdRincianRow): number {
    const sesudah = Number(row.total_harga)
    if (Number.isFinite(sesudah) && sesudah > 0) return sesudah
    return Number(row.total_harga_murni) || 0
}

/** Bangun search params /pekerjaan/new dari satu baris rincian. */
export function buildBuatPaketSearch(
    row: SipdRincianRow,
    parent: SipdParentContext,
): BuatPaketSearch {
    const search: BuatPaketSearch = {}
    const nama = defaultNamaPaket(row)
    if (nama) search.sipd_nama_paket = nama.slice(0, 225)
    // Kode rekening paket = kode sub kegiatan (level sub kegiatan),
    // bukan kode_akun/Rekening level rincian.
    if (parent.kodeSubGiat) search.sipd_kode_rekening = parent.kodeSubGiat
    search.sipd_pagu = String(defaultPagu(row))
    if (parent.kodeSubGiat) search.sipd_kode_sub_giat = parent.kodeSubGiat
    if (parent.namaSubGiat) search.sipd_nama_sub = parent.namaSubGiat
    if (Number.isFinite(parent.idSubBl) && parent.idSubBl > 0) {
        search.sipd_id_sub_bl = String(parent.idSubBl)
    }
    const idRinci = Number(row.id_rinci_sub_bl)
    if (Number.isFinite(idRinci) && idRinci > 0) {
        search.sipd_id_rinci = String(idRinci)
    }
    return search
}

/** Cocokkan kegiatan untuk prefill: sipd_id → kode_sub_giat → nama+tahun. */
export function matchKegiatanForBuatPaket(
    search: BuatPaketSearch,
    kegiatanList: Kegiatan[],
    tahun: string,
): Kegiatan | null {
    const idSub = Number(search.sipd_id_sub_bl)
    if (Number.isFinite(idSub) && idSub > 0) {
        const byId = kegiatanList.find((k) => Number(k.sipd_id_sub_bl) === idSub)
        if (byId) return byId
    }
    const kode = (search.sipd_kode_sub_giat || '').trim()
    if (kode) {
        const byKode = kegiatanList.find((k) => {
            if ((k.kode_sub_giat || '').trim() === kode) return true
            const reks = Array.isArray(k.kode_rekening) ? k.kode_rekening : []
            return reks.some((r) => String(r).trim() === kode)
        })
        if (byKode) return byKode
    }
    const subNorm = normalizeSyncText(search.sipd_nama_sub)
    if (subNorm) {
        const byName = kegiatanList.filter((k) => {
            const yearOk =
                !tahun ||
                String(k.tahun_anggaran || '').trim() === tahun ||
                String(k.tahun_anggaran || '').includes(tahun)
            return yearOk && normalizeSyncText(k.nama_sub_kegiatan) === subNorm
        })
        if (byName.length === 1) return byName[0]
    }
    return null
}
