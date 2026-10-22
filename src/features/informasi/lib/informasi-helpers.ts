import type { Informasi, InformasiFormData, InformasiKategori } from '../types'

export const KATEGORI_OPSI: ReadonlyArray<{ value: InformasiKategori; label: string; tone: string }> = [
    { value: 'fitur-baru', label: 'Fitur baru', tone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' },
    { value: 'pemeliharaan', label: 'Pemeliharaan sistem', tone: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200' },
    { value: 'pengumuman', label: 'Pengumuman', tone: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200' },
    { value: 'lainnya', label: 'Lainnya', tone: 'bg-muted text-muted-foreground' },
]

export function kategoriInfo(kategori: InformasiKategori) {
    return KATEGORI_OPSI.find((k) => k.value === kategori) ?? KATEGORI_OPSI[KATEGORI_OPSI.length - 1]!
}

export const STATUS_TONE: Record<StatusTampil, string> = {
    draft: 'bg-muted text-muted-foreground',
    terjadwal: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
    berakhir: 'bg-muted text-muted-foreground',
    tampil: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
}

export type StatusTampil = 'draft' | 'terjadwal' | 'berakhir' | 'tampil'

/** Status untuk admin: draft bila tidak terbit, lalu dibandingkan dengan tanggal hari ini dari server. */
export function statusTampil(item: Pick<Informasi, 'terbit' | 'tampil_dari' | 'tampil_sampai'>, today: string): StatusTampil {
    if (!item.terbit) return 'draft'
    if (item.tampil_dari && item.tampil_dari > today) return 'terjadwal'
    if (item.tampil_sampai && item.tampil_sampai < today) return 'berakhir'
    return 'tampil'
}

export const STATUS_LABEL: Record<StatusTampil, string> = {
    draft: 'Draft',
    terjadwal: 'Terjadwal',
    berakhir: 'Berakhir',
    tampil: 'Tampil',
}

const tanggalFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

/** `YYYY-MM-DD` ke teks tanggal Indonesia. Dibentuk dari bagian tanggal, bukan `new Date(string)`, agar tidak bergeser zona waktu. */
export function formatTanggalIso(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number)
    return tanggalFormatter.format(new Date(y!, m! - 1, d!))
}

/** Teks rentang tampil, atau null bila tidak ada tanggal. */
export function rentangTampil(item: Pick<Informasi, 'tampil_dari' | 'tampil_sampai'>): string | null {
    if (item.tampil_dari && item.tampil_sampai) {
        return `${formatTanggalIso(item.tampil_dari)} s.d. ${formatTanggalIso(item.tampil_sampai)}`
    }
    if (item.tampil_dari) return `Mulai ${formatTanggalIso(item.tampil_dari)}`
    if (item.tampil_sampai) return `Sampai ${formatTanggalIso(item.tampil_sampai)}`
    return null
}

/** Batas isi dalam karakter HTML, termasuk tag dari editor. */
export const ISI_MAX_CHARS = 100_000

const PENANDA_HTML = /<[a-z][\s\S]*>/i

function escapeHtml(teks: string): string {
    return teks.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Isi yang sudah HTML dikembalikan apa adanya. Isi teks biasa dari data lama diubah menjadi paragraf,
 * agar bisa dibuka di editor dan ditampilkan seperti publikasi.
 */
export function isiToHtml(isi: string): string {
    if (PENANDA_HTML.test(isi)) return isi
    return isi
        .split(/\n{2,}/)
        .map((paragraf) => `<p>${escapeHtml(paragraf).replace(/\n/g, '<br>')}</p>`)
        .join('')
}

/** Teks polos dari isi (HTML atau teks biasa). DOMParser tidak memuat gambar maupun menjalankan skrip. */
export function isiToTeks(isi: string): string {
    const teks = PENANDA_HTML.test(isi)
        ? new DOMParser()
            .parseFromString(isi.replace(/<\/(p|h[1-6]|li|div|blockquote)>|<br\s*\/?>/gi, ' $& '), 'text/html')
            .body.textContent ?? ''
        : isi
    return teks.replace(/\s+/g, ' ').trim()
}

/** Ringkasan satu-dua baris untuk daftar. */
export function ringkasan(isi: string, panjang = 180): string {
    const teks = isiToTeks(isi)
    return teks.length > panjang ? `${teks.slice(0, panjang).trimEnd()}…` : teks
}

export function emptyInformasiForm(): InformasiFormData {
    return { judul: '', isi: '', kategori: 'pengumuman', terbit: true, tampil_dari: null, tampil_sampai: null }
}

export function toInformasiForm(item: Informasi): InformasiFormData {
    return {
        judul: item.judul,
        isi: isiToHtml(item.isi),
        kategori: item.kategori,
        terbit: item.terbit,
        tampil_dari: item.tampil_dari,
        tampil_sampai: item.tampil_sampai,
    }
}

/** Pemeriksaan sisi klien sebelum dikirim. Server tetap memeriksa ulang. Mengembalikan pesan per field. */
export function validasiInformasiForm(form: InformasiFormData): Partial<Record<'judul' | 'isi' | 'tampil_sampai', string>> {
    const errors: Partial<Record<'judul' | 'isi' | 'tampil_sampai', string>> = {}
    if (!form.judul.trim()) errors.judul = 'Judul wajib diisi.'
    else if (form.judul.trim().length > 255) errors.judul = 'Judul maksimal 255 karakter.'
    if (!isiToTeks(form.isi)) errors.isi = 'Isi wajib diisi.'
    else if (form.isi.length > ISI_MAX_CHARS) errors.isi = 'Isi terlalu panjang. Kurangi isi atau gambar yang disisipkan.'
    if (form.tampil_dari && form.tampil_sampai && form.tampil_sampai < form.tampil_dari) {
        errors.tampil_sampai = 'Tanggal selesai tidak boleh sebelum tanggal mulai.'
    }
    return errors
}
