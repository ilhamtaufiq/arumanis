import type { SipdPekerjaanLookup } from './pekerjaan-match'

function formatFotoStatus(status: string | null | undefined): string {
    switch (status) {
        case 'selesai':
            return 'Lengkap'
        case 'belum_selesai':
            return 'Belum lengkap'
        case 'belum_ada_foto':
            return 'Belum ada foto'
        default:
            return status ?? '-'
    }
}

export type ArumanisStatusTone = 'none' | 'registered' | 'progress' | 'kontrak'

export interface ArumanisStatusInfo {
    label: string
    tone: ArumanisStatusTone
    detail?: string
}

export function getArumanisStatus(pekerjaan: SipdPekerjaanLookup): ArumanisStatusInfo {
    const hasKontrak = (pekerjaan.kontrak?.length ?? 0) > 0
    const progress = pekerjaan.progress_total ?? 0
    const fotoLabel = formatFotoStatus(pekerjaan.foto_status)

    if (hasKontrak) {
        return {
            label: 'Kontrak',
            tone: 'kontrak',
            detail: progress > 0 ? `Progress ${progress.toFixed(0)}%` : fotoLabel !== '-' ? fotoLabel : undefined,
        }
    }

    if (progress > 0) {
        return {
            label: `Progress ${progress.toFixed(0)}%`,
            tone: 'progress',
            detail: fotoLabel !== '-' ? fotoLabel : undefined,
        }
    }

    return {
        label: 'Terdaftar',
        tone: 'registered',
        detail: fotoLabel !== '-' && pekerjaan.foto_status !== 'selesai' ? fotoLabel : undefined,
    }
}