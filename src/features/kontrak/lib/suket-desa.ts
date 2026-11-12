import type { KontrakSuketDesaExportParams } from '../types'
import { isValidIsoDateString, toIsoDateString } from './bmd-surat-pernyataan'

export const SUKET_DESA_MAX_LENGTH = {
    nomor_surat: 200,
    nama_kepala_desa: 150,
    alamat_kantor: 300,
    serah_terima_kepada: 200,
    nomor_ba: 200,
} as const

export type SuketDesaForm = {
    nomor_surat: string
    tanggal_surat: string
    nama_kepala_desa: string
    alamat_kantor: string
    serah_terima_kepada: string
    nomor_ba: string
    tanggal_ba: string
}

export type SuketDesaField = keyof SuketDesaForm

export type SuketDesaFieldError = {
    field: SuketDesaField
    message: string
}

/** Form kosong; hanya tanggal surat yang default hari ini. Tanpa prefill lainnya. */
export function createDefaultSuketDesaForm(today: Date = new Date()): SuketDesaForm {
    return {
        nomor_surat: '',
        tanggal_surat: toIsoDateString(today),
        nama_kepala_desa: '',
        alamat_kantor: '',
        serah_terima_kepada: '',
        nomor_ba: '',
        tanggal_ba: '',
    }
}

const TEXT_FIELD_LABELS: Record<Exclude<SuketDesaField, 'tanggal_surat' | 'tanggal_ba'>, string> = {
    nomor_surat: 'Nomor surat',
    nama_kepala_desa: 'Nama kepala desa',
    alamat_kantor: 'Alamat kantor',
    serah_terima_kepada: 'Diserahterimakan kepada',
    nomor_ba: 'Nomor Berita Acara',
}

/** Mengembalikan daftar kesalahan per field; daftar kosong berarti isian sudah valid. */
export function validateSuketDesaForm(form: SuketDesaForm): SuketDesaFieldError[] {
    const errors: SuketDesaFieldError[] = []

    for (const field of Object.keys(TEXT_FIELD_LABELS) as Array<keyof typeof TEXT_FIELD_LABELS>) {
        const label = TEXT_FIELD_LABELS[field]
        const value = form[field].trim()
        const max = SUKET_DESA_MAX_LENGTH[field]

        if (!value) {
            errors.push({ field, message: `${label} wajib diisi.` })
        } else if (value.length > max) {
            errors.push({ field, message: `${label} maksimal ${max} karakter.` })
        }
    }

    if (!form.tanggal_surat) {
        errors.push({ field: 'tanggal_surat', message: 'Tanggal surat wajib diisi.' })
    } else if (!isValidIsoDateString(form.tanggal_surat)) {
        errors.push({ field: 'tanggal_surat', message: 'Tanggal surat tidak valid.' })
    }

    if (!form.tanggal_ba) {
        errors.push({ field: 'tanggal_ba', message: 'Tanggal Berita Acara wajib diisi.' })
    } else if (!isValidIsoDateString(form.tanggal_ba)) {
        errors.push({ field: 'tanggal_ba', message: 'Tanggal Berita Acara tidak valid.' })
    }

    return errors
}

export function buildSuketDesaExportPayload(form: SuketDesaForm): KontrakSuketDesaExportParams {
    return {
        nomor_surat: form.nomor_surat.trim(),
        tanggal_surat: form.tanggal_surat,
        nama_kepala_desa: form.nama_kepala_desa.trim(),
        alamat_kantor: form.alamat_kantor.trim(),
        serah_terima_kepada: form.serah_terima_kepada.trim(),
        nomor_ba: form.nomor_ba.trim(),
        tanggal_ba: form.tanggal_ba,
    }
}
