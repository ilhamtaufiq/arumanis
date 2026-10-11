import type { JurnalRhk } from '../types'

export const RHK_DEFAULT_SATUAN = 'Dokumen'
export const RHK_NAME_MAX = 255
export const RHK_NO_MIN = 1
export const RHK_NO_MAX = 99
export const RHK_BULAN_SINGKAT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'] as const

/** Baris RHK pada form pengaturan. Semua nilai berbentuk string agar input kosong bisa dikenali. */
export interface RhkRowForm {
    key: string
    no: number
    rhk: string
    target: string
    satuan: string
    rencana: string[]
}

export interface RhkRowErrors {
    rhk?: string
    target?: string
    satuan?: string
    rencana?: string
    no?: string
}

/** Nilai rencana kosong dianggap 0. Mengembalikan null bila bukan angka >= 0. */
export function parseRencanaValue(raw: string): number | null {
    const trimmed = raw.trim()
    if (trimmed === '') return 0
    const n = Number(trimmed)
    return Number.isFinite(n) && n >= 0 ? n : null
}

/** Memaksa daftar rencana menjadi tepat 12 angka (kurang diisi 0, lebih dipotong, nilai tak valid jadi 0). */
export function normalizeRencana(values: ReadonlyArray<number | string | null | undefined>): number[] {
    return Array.from({ length: 12 }, (_, index) => {
        const raw = values[index]
        const n = typeof raw === 'number' ? raw : Number(raw ?? 0)
        return Number.isFinite(n) && n >= 0 ? n : 0
    })
}

export function emptyRhkRow(no: number, key: string): RhkRowForm {
    return {
        key,
        no,
        rhk: '',
        target: '',
        satuan: RHK_DEFAULT_SATUAN,
        rencana: Array.from({ length: 12 }, () => ''),
    }
}

export function rhkToRow(item: JurnalRhk, key: string): RhkRowForm {
    const rencana = normalizeRencana(item.rencana)
    return {
        key,
        no: item.no,
        rhk: item.rhk,
        target: String(item.target),
        satuan: item.satuan || RHK_DEFAULT_SATUAN,
        rencana: rencana.map((n) => String(n)),
    }
}

/** Nomor baru = nomor terbesar + 1. Nomor yang sudah dihapus tidak dipakai ulang agar relasi jurnal tetap. */
export function nextRhkNo(rows: ReadonlyArray<{ no: number }>): number {
    const max = rows.reduce((acc, row) => Math.max(acc, row.no), 0)
    return max + 1
}

/** Validasi sisi klien untuk satu daftar baris. Mengembalikan error per key baris. */
export function validateRhkRows(rows: RhkRowForm[]): Record<string, RhkRowErrors> {
    const result: Record<string, RhkRowErrors> = {}
    const seenNo = new Map<number, string>()

    for (const row of rows) {
        const errors: RhkRowErrors = {}

        if (row.no < RHK_NO_MIN || row.no > RHK_NO_MAX) {
            errors.no = `Nomor harus ${RHK_NO_MIN}-${RHK_NO_MAX}`
        } else if (seenNo.has(row.no)) {
            errors.no = `Nomor ${row.no} dipakai lebih dari satu RHK`
        } else {
            seenNo.set(row.no, row.key)
        }

        const name = row.rhk.trim()
        if (name === '') errors.rhk = 'Nama RHK wajib diisi'
        else if (name.length > RHK_NAME_MAX) errors.rhk = `Nama RHK maksimal ${RHK_NAME_MAX} karakter`

        const target = row.target.trim()
        if (target === '') {
            errors.target = 'Target wajib diisi'
        } else {
            const n = Number(target)
            if (!Number.isFinite(n) || n < 0) errors.target = 'Target harus angka 0 atau lebih'
        }

        if (row.satuan.trim() === '') errors.satuan = 'Satuan wajib diisi'

        if (row.rencana.some((value) => parseRencanaValue(value) === null)) {
            errors.rencana = 'Rencana bulanan harus angka 0 atau lebih'
        }

        if (Object.keys(errors).length > 0) result[row.key] = errors
    }

    return result
}

/** Mengubah baris form menjadi payload. Panggil hanya setelah validateRhkRows kosong. */
export function rowsToRhkItems(rows: RhkRowForm[]): JurnalRhk[] {
    return [...rows]
        .sort((a, b) => a.no - b.no)
        .map((row) => ({
            no: row.no,
            rhk: row.rhk.trim(),
            target: Number(row.target.trim()),
            satuan: row.satuan.trim(),
            rencana: normalizeRencana(row.rencana.map((value) => parseRencanaValue(value) ?? 0)),
        }))
}

/** Opsi dropdown RHK di form jurnal. */
export function rhkOptionLabel(item: { no: number; rhk: string }): string {
    return `RHK ${item.no} · ${item.rhk}`
}

/** Mengubah teks "a; b ;c" menjadi "a;b;c". Kosong berarti undefined (tidak dikirim). */
export function parseStrategi(text: string): string | undefined {
    const parts = text
        .split(';')
        .map((part) => part.trim())
        .filter((part) => part !== '')
    return parts.length > 0 ? parts.join(';') : undefined
}

export function optionalQueryText(text: string): string | undefined {
    const trimmed = text.trim()
    return trimmed === '' ? undefined : trimmed
}

/** Pesan error untuk field tertentu dari 422. Kontrak backend memakai satu string untuk seluruh "items". */
export function firstErrorMessage(
    errors: Record<string, string[] | string | undefined> | undefined,
    key: string,
): string | null {
    const raw = errors?.[key]
    const message = Array.isArray(raw) ? raw[0] : raw
    return message || null
}
