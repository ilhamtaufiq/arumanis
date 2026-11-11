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

/**
 * Jenis surat untuk satu dokumen: kode persis (`SPK`) atau kode dengan akhiran (`SPK-...`).
 * Diurutkan dari kode terpendek supaya kode persisnya tampil paling atas.
 */
export function jenisUntuk<T extends JenisDokumen>(daftar: T[], kode: KodeNomorKontrak): T[] {
    return daftar
        .filter((j) => {
            const c = (j.code ?? '').trim().toUpperCase()
            return c === kode || c.startsWith(`${kode}-`)
        })
        .sort((a, b) => {
            const ca = (a.code ?? '').trim().toUpperCase()
            const cb = (b.code ?? '').trim().toUpperCase()
            return ca.length - cb.length || ca.localeCompare(cb)
        })
}
