/** Kode jenis surat yang dibuat dari form kontrak. Harus sama dengan kode di Penomoran Surat. */
export type KodeNomorKontrak = 'SPPBJ' | 'SPK' | 'SPMK'

/** Judul surat per dokumen, dipakai sebagai perihal saat nomor dibuat dari form kontrak. */
export const PERIHAL_NOMOR: Record<KodeNomorKontrak, string> = {
    SPPBJ: 'Surat Penunjukan Penyedia Barang/Jasa',
    SPK: 'Surat Perjanjian Kontrak',
    SPMK: 'Surat Perintah Mulai Kerja',
}

/** Perihal lengkap, dengan nama penyedia bila ada. */
export function perihalNomor(kode: KodeNomorKontrak, namaPenyedia: string | null | undefined): string {
    const judul = PERIHAL_NOMOR[kode]
    const nama = namaPenyedia?.trim()
    return nama ? `${judul} — ${nama}` : judul
}

type JenisDokumen = { id: number; code?: string | null }

/** Jenis surat dengan kode yang cocok (tanpa memperhatikan huruf besar). `undefined` bila belum ada. */
export function cariJenis<T extends JenisDokumen>(daftar: T[], kode: KodeNomorKontrak): T | undefined {
    return daftar.find((j) => (j.code ?? '').trim().toUpperCase() === kode)
}
