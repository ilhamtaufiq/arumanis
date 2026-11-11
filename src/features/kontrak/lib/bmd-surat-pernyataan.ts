import type { KontrakBmdExportParams } from '../types'

export const BMD_NOMOR_SURAT_MAX_LENGTH = 200

export type BmdSuratPernyataanForm = {
    nomor_surat: string
    tanggal_surat: string
    tanggal_perolehan: string
}

/** Format YYYY-MM-DD memakai komponen tanggal lokal (tanpa geseran zona waktu). */
export function toIsoDateString(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

/** Benar bila teks berformat YYYY-MM-DD dan merupakan tanggal kalender yang ada. */
export function isValidIsoDateString(value: string): boolean {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
    if (!match) return false

    const year = Number(match[1])
    const month = Number(match[2])
    const day = Number(match[3])
    const date = new Date(year, month - 1, day)

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    )
}

export function createDefaultBmdForm(today: Date = new Date()): BmdSuratPernyataanForm {
    const todayIso = toIsoDateString(today)
    return {
        nomor_surat: '',
        tanggal_surat: todayIso,
        tanggal_perolehan: todayIso,
    }
}

/** Mengembalikan daftar pesan kesalahan; daftar kosong berarti isian sudah valid. */
export function validateBmdForm(form: BmdSuratPernyataanForm): string[] {
    const errors: string[] = []

    const nomor = form.nomor_surat.trim()
    if (!nomor) {
        errors.push('Nomor surat wajib diisi.')
    } else if (nomor.length > BMD_NOMOR_SURAT_MAX_LENGTH) {
        errors.push(`Nomor surat maksimal ${BMD_NOMOR_SURAT_MAX_LENGTH} karakter.`)
    }

    if (!form.tanggal_surat) {
        errors.push('Tanggal surat wajib diisi.')
    } else if (!isValidIsoDateString(form.tanggal_surat)) {
        errors.push('Tanggal surat tidak valid.')
    }

    if (!form.tanggal_perolehan) {
        errors.push('Tanggal perolehan wajib diisi.')
    } else if (!isValidIsoDateString(form.tanggal_perolehan)) {
        errors.push('Tanggal perolehan tidak valid.')
    }

    return errors
}

export function buildBmdExportPayload(form: BmdSuratPernyataanForm): KontrakBmdExportParams {
    return {
        nomor_surat: form.nomor_surat.trim(),
        tanggal_surat: form.tanggal_surat,
        tanggal_perolehan: form.tanggal_perolehan,
    }
}
