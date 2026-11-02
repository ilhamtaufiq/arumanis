import type { SipdRincianRow } from '@/features/sipd-renja/types'
import { adalahAkunLokasi, type HasilLokasi } from '@/features/sipd-renja/lib/lokasi-wilayah'

export const KATEGORI_FISIK = 'Kegiatan Fisik'
export const KATEGORI_PENUNJANG = 'Penunjang'

export type FilterKategori = 'semua' | 'fisik' | 'penunjang'
export type UrutRincian = 'urutan' | 'rekening' | 'total-desc' | 'total-asc' | 'desa' | 'uraian'

/** Belanja Barang untuk Dijual/Diserahkan kepada Masyarakat adalah kegiatan fisik; selain itu penunjang. */
export function kategoriRincian(row: { nama_akun?: string | null }): typeof KATEGORI_FISIK | typeof KATEGORI_PENUNJANG {
    return adalahAkunLokasi(row.nama_akun) ? KATEGORI_FISIK : KATEGORI_PENUNJANG
}

/** "Rincian 1.03.03.2.01.0028 Rekening 5.1.02.04.001.00001". Bagian yang kosong dilewati. */
export function formatKodeRekening(kodeRincian: string | null | undefined, kodeAkun: string | null | undefined): string {
    const bagian: string[] = []
    if (kodeRincian && kodeRincian.trim()) bagian.push(`Rincian ${kodeRincian.trim()}`)
    if (kodeAkun && kodeAkun.trim()) bagian.push(`Rekening ${kodeAkun.trim()}`)
    return bagian.join(' ')
}

const angka = (v: unknown) => Number(v ?? 0) || 0

/**
 * Filter kategori lalu urutkan. Urutan asli dipertahankan bila urut = 'urutan'.
 * Sort desa: baris tanpa desa diletakkan paling akhir.
 */
export function terapkanFilterUrut(
    rows: SipdRincianRow[],
    lokasi: Map<number, HasilLokasi>,
    opsi: { kategori: FilterKategori; urut: UrutRincian },
): SipdRincianRow[] {
    const terfilter = rows.filter((row) => {
        if (opsi.kategori === 'semua') return true
        const k = kategoriRincian(row)
        return opsi.kategori === 'fisik' ? k === KATEGORI_FISIK : k === KATEGORI_PENUNJANG
    })
    if (opsi.urut === 'urutan') return terfilter

    const hasil = [...terfilter]
    const teks = (v: unknown) => String(v ?? '')
    const desaOf = (row: SipdRincianRow) => lokasi.get(Number(row.id_rinci_sub_bl))?.desa ?? ''
    hasil.sort((a, b) => {
        switch (opsi.urut) {
            case 'rekening':
                return teks(a.kode_akun).localeCompare(teks(b.kode_akun), 'id')
            case 'total-desc':
                return angka(b.total_harga) - angka(a.total_harga)
            case 'total-asc':
                return angka(a.total_harga) - angka(b.total_harga)
            case 'desa': {
                const da = desaOf(a)
                const db = desaOf(b)
                if (!da && db) return 1
                if (da && !db) return -1
                return da.localeCompare(db, 'id')
            }
            case 'uraian':
                return teks(a.subs_bl_teks).localeCompare(teks(b.subs_bl_teks), 'id')
            default:
                return 0
        }
    })
    return hasil
}
