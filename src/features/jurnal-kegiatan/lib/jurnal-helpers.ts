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
