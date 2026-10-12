import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

import type { JurnalEntry, JurnalFormValues, JurnalPayload } from '../types'

export const MONTH_NAMES_ID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
] as const

export const RHK_MIN = 1
export const RHK_MAX = 99

const pad2 = (n: number) => String(n).padStart(2, '0')

/** Tanggal lokal (bukan UTC) dalam format YYYY-MM-DD untuk nilai default input date. */
export function toIsoDate(date: Date): string {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

/** Mengubah YYYY-MM-DD menjadi dd/mm/yyyy tanpa melewati objek Date (hindari pergeseran zona waktu). */
export function formatTanggal(iso: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
    if (!match) return iso
    return `${match[3]}/${match[2]}/${match[1]}`
}

/** Menggeser periode tahun/bulan sebanyak delta bulan (delta boleh negatif). */
export function shiftMonth(tahun: number, bulan: number, delta: number): { tahun: number; bulan: number } {
    const index = tahun * 12 + (bulan - 1) + delta
    return { tahun: Math.floor(index / 12), bulan: (index % 12) + 1 }
}

/** Kunci periode bulan, mis. "2026-10", untuk label dan perbandingan. */
export function periodKey(tahun: number, bulan: number): string {
    return `${tahun}-${pad2(bulan)}`
}

/** Urutan terbaru dulu: tanggal menurun, lalu id menurun. Mengembalikan salinan baru. */
export function sortJurnalNewestFirst(entries: JurnalEntry[]): JurnalEntry[] {
    return [...entries].sort((a, b) => {
        if (a.tanggal !== b.tanggal) return a.tanggal < b.tanggal ? 1 : -1
        return b.id - a.id
    })
}

export function emptyJurnalFormValues(tanggal: string): JurnalFormValues {
    return { tanggal, rhk: '', kegiatan: '', output: '', satuan: '', keterangan: '' }
}

export function toJurnalFormValues(entry: JurnalEntry): JurnalFormValues {
    return {
        tanggal: entry.tanggal,
        rhk: entry.rhk === null ? '' : String(entry.rhk),
        kegiatan: entry.kegiatan,
        output: entry.output === null ? '' : String(entry.output),
        satuan: entry.satuan ?? '',
        keterangan: entry.keterangan ?? '',
    }
}

function optionalText(value: string): string | null {
    const trimmed = value.trim()
    return trimmed === '' ? null : trimmed
}

export function toJurnalPayload(values: JurnalFormValues): JurnalPayload {
    return {
        tanggal: values.tanggal,
        rhk: values.rhk.trim() === '' ? null : Number(values.rhk),
        kegiatan: values.kegiatan.trim(),
        output: values.output.trim() === '' ? null : Number(values.output),
        satuan: optionalText(values.satuan),
        keterangan: optionalText(values.keterangan),
    }
}

/** Mengubah objek errors 422 (field -> pesan[]) menjadi satu pesan per field. */
export function firstErrorPerField(
    errors: Record<string, string[] | string | undefined> | undefined,
): Partial<Record<keyof JurnalFormValues, string>> {
    const result: Partial<Record<keyof JurnalFormValues, string>> = {}
    if (!errors) return result
    const fields: (keyof JurnalFormValues)[] = ['tanggal', 'rhk', 'kegiatan', 'output', 'satuan', 'keterangan']
    for (const field of fields) {
        const raw = errors[field]
        const message = Array.isArray(raw) ? raw[0] : raw
        if (message) result[field] = message
    }
    return result
}

export const FOTO_MAX_COUNT = 10
export const FOTO_MAX_BYTES = 10 * 1024 * 1024
export const FOTO_ACCEPT_TYPES = ['image/jpeg', 'image/png'] as const
export const FOTO_ACCEPT_ATTR = FOTO_ACCEPT_TYPES.join(',')
export const FOTO_THUMB_LIMIT = 5

/** Sumber gambar untuk daftar: thumbnail, atau url penuh bila thumbnail kosong. */
export function fotoThumbSrc(foto: { url: string; thumb: string }): string {
    return foto.thumb || foto.url
}

/** Membagi foto untuk daftar: beberapa pertama ditampilkan, sisanya dihitung sebagai "+n". */
export function splitFotoForThumbs<T>(foto: T[], limit = FOTO_THUMB_LIMIT): { visible: T[]; remaining: number } {
    return { visible: foto.slice(0, limit), remaining: Math.max(0, foto.length - limit) }
}

export function formatBytesMb(bytes: number): string {
    return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`
}

/**
 * Memeriksa berkas yang baru dipilih sebelum diunggah.
 * `sudahAda` adalah jumlah foto yang sudah tersimpan atau sudah dipilih sebelumnya.
 */
export function validateFotoSelection(
    files: File[],
    sudahAda: number,
    options: { maxCount?: number; batasLabel?: string } = {},
): { accepted: File[]; messages: string[] } {
    const maxCount = options.maxCount ?? FOTO_MAX_COUNT
    const batasLabel = options.batasLabel ?? 'per kegiatan'
    const messages: string[] = []
    const valid: File[] = []
    let slotTersisa = Math.max(0, maxCount - sudahAda)

    for (const file of files) {
        if (!(FOTO_ACCEPT_TYPES as readonly string[]).includes(file.type)) {
            messages.push(`"${file.name}" harus berformat JPG atau PNG.`)
            continue
        }
        if (file.size > FOTO_MAX_BYTES) {
            messages.push(`"${file.name}" melebihi batas 10 MB.`)
            continue
        }
        if (slotTersisa <= 0) {
            messages.push(`Maksimal ${maxCount} foto ${batasLabel}. "${file.name}" tidak ditambahkan.`)
            continue
        }
        slotTersisa -= 1
        valid.push(file)
    }

    return { accepted: valid, messages }
}

/** Mengambil pesan error untuk field foto dari 422 (bisa berupa string atau daftar string). */
export function fotoErrorMessage(errors: Record<string, string[] | string | undefined> | undefined): string | null {
    const raw = errors?.foto
    const message = Array.isArray(raw) ? raw[0] : raw
    return message || null
}

/** "Senin, 5 Oktober 2026" dari YYYY-MM-DD, dihitung tanpa melewati zona waktu. */
export function formatTanggalPanjang(iso: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.slice(0, 10))
    if (!match) return iso
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    return format(date, 'EEEE, d MMMM yyyy', { locale: idLocale })
}

/** Jumlah hari dalam bulan (bulan 1-12). */
export function daysInMonth(tahun: number, bulan: number): number {
    return new Date(tahun, bulan, 0).getDate()
}

/** Kelompok kegiatan per tanggal, urutan mengikuti urutan input (sudah terbaru di atas). */
export function groupByTanggal(entries: JurnalEntry[]): { tanggal: string; items: JurnalEntry[] }[] {
    const groups: { tanggal: string; items: JurnalEntry[] }[] = []
    for (const entry of entries) {
        const last = groups[groups.length - 1]
        if (last && last.tanggal === entry.tanggal) {
            last.items.push(entry)
        } else {
            groups.push({ tanggal: entry.tanggal, items: [entry] })
        }
    }
    return groups
}

export interface RhkTone {
    /** Titik atau strip penanda. */
    dot: string
    /** Label RHK (badge). */
    badge: string
    /** Batang proporsi di ringkasan. */
    bar: string
}

const NEUTRAL_TONE: RhkTone = {
    dot: 'bg-muted-foreground/40',
    badge: 'bg-muted text-muted-foreground',
    bar: 'bg-muted-foreground/40',
}

/** Enam warna berulang, sama di daftar, kalender, dan ringkasan. Kelas ditulis penuh agar terdeteksi Tailwind. */
const RHK_TONES: RhkTone[] = [
    { dot: 'bg-sky-500', badge: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200', bar: 'bg-sky-500' },
    { dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200', bar: 'bg-emerald-500' },
    { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200', bar: 'bg-amber-500' },
    { dot: 'bg-violet-500', badge: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200', bar: 'bg-violet-500' },
    { dot: 'bg-rose-500', badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200', bar: 'bg-rose-500' },
    { dot: 'bg-teal-500', badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200', bar: 'bg-teal-500' },
]

export function rhkTone(rhk: number | null): RhkTone {
    if (rhk === null || rhk < 1) return NEUTRAL_TONE
    return RHK_TONES[(rhk - 1) % RHK_TONES.length]
}

/** Daftar RHK unik yang muncul pada entri, urut naik. Dipakai sebagai legenda kalender. */
export function rhkLegend(entries: JurnalEntry[]): number[] {
    const set = new Set<number>()
    for (const entry of entries) {
        if (entry.rhk !== null && entry.rhk >= 1) set.add(entry.rhk)
    }
    return [...set].sort((a, b) => a - b)
}
