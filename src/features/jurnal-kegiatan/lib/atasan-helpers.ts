import type { JurnalAtasan, JurnalAtasanField } from '../types'

export const ATASAN_FIELDS: { key: JurnalAtasanField; label: string; placeholder: string }[] = [
    { key: 'nama', label: 'Nama', placeholder: 'Nama lengkap beserta gelar' },
    { key: 'nip', label: 'NIP', placeholder: 'Nomor Induk Pegawai' },
    { key: 'pangkat', label: 'Pangkat/Golongan', placeholder: 'mis. Pembina / IV/a' },
    { key: 'jabatan', label: 'Jabatan', placeholder: 'Jabatan' },
    { key: 'unit', label: 'Unit Kerja', placeholder: 'Unit kerja' },
]

export function emptyAtasan(): JurnalAtasan {
    return { nama: '', nip: '', pangkat: '', jabatan: '', unit: '' }
}

/** Data dari server ke form. Null diperlakukan sebagai kosong. */
export function atasanToForm(data: Partial<Record<JurnalAtasanField, string | null>> | null | undefined): JurnalAtasan {
    return {
        nama: data?.nama ?? '',
        nip: data?.nip ?? '',
        pangkat: data?.pangkat ?? '',
        jabatan: data?.jabatan ?? '',
        unit: data?.unit ?? '',
    }
}

/** Form ke payload: spasi dibuang. Field kosong tetap string kosong (kontrak backend). */
export function atasanToPayload(form: JurnalAtasan): JurnalAtasan {
    return {
        nama: form.nama.trim(),
        nip: form.nip.trim(),
        pangkat: form.pangkat.trim(),
        jabatan: form.jabatan.trim(),
        unit: form.unit.trim(),
    }
}
