import type { MasaPemeliharaanRow } from '../api/masa-pemeliharaan'

const HARI_MS = 24 * 60 * 60 * 1000

/** Batas peringatan: paket yang akan berakhir dalam jumlah hari ini ditandai. */
export const BATAS_PERINGATAN_HARI = 30

/** Tanggal YYYY-MM-DD ke tengah malam waktu lokal, supaya selisih hari tidak dipengaruhi zona waktu. */
export function parseTanggal(iso: string): Date {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d)
}

/** Selisih hari dari `hariIni` ke tanggal akhir. Negatif berarti sudah lewat. */
export function sisaHari(tanggalAkhir: string, hariIni: Date): number {
    const awal = new Date(hariIni.getFullYear(), hariIni.getMonth(), hariIni.getDate())
    return Math.round((parseTanggal(tanggalAkhir).getTime() - awal.getTime()) / HARI_MS)
}

export type StatusFilter = 'semua' | 'berjalan' | 'berakhir' | 'segera'

export type RingkasanMasa = {
    total: number
    berjalan: number
    berakhir: number
    segera: number
}

/** Ringkasan untuk kartu di atas tabel. `segera` = berjalan dan berakhir dalam `BATAS_PERINGATAN_HARI`. */
export function ringkasanMasa(rows: MasaPemeliharaanRow[], hariIni: Date): RingkasanMasa {
    let berjalan = 0
    let segera = 0
    for (const r of rows) {
        if (r.status === 'berjalan') {
            berjalan += 1
            const sisa = sisaHari(r.tanggal_akhir, hariIni)
            if (sisa <= BATAS_PERINGATAN_HARI) segera += 1
        }
    }
    return { total: rows.length, berjalan, berakhir: rows.length - berjalan, segera }
}

/** Filter status dan pencarian nama paket atau nomor BASTP. Hasil diurutkan dari akhir masa paling dekat. */
export function filterMasa(
    rows: MasaPemeliharaanRow[],
    { status, cari, hariIni }: { status: StatusFilter; cari: string; hariIni: Date },
): MasaPemeliharaanRow[] {
    const kata = cari.trim().toLowerCase()
    return rows
        .filter((r) => {
            if (status === 'berjalan' && r.status !== 'berjalan') return false
            if (status === 'berakhir' && r.status !== 'berakhir') return false
            if (status === 'segera') {
                if (r.status !== 'berjalan' || sisaHari(r.tanggal_akhir, hariIni) > BATAS_PERINGATAN_HARI) return false
            }
            if (!kata) return true
            return (r.nama_paket ?? '').toLowerCase().includes(kata) || (r.nomor_bastp ?? '').toLowerCase().includes(kata)
        })
        .sort((a, b) => a.tanggal_akhir.localeCompare(b.tanggal_akhir))
}
