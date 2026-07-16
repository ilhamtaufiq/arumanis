import type { Foto } from '@/features/foto/types'

export const FOTO_PROGRESS_LEVELS = ['0%', '25%', '50%', '75%', '100%'] as const

export type FotoProgressLevel = (typeof FOTO_PROGRESS_LEVELS)[number]

export const FOTO_TAB_ITEMS_PER_PAGE = 10

export type FotoKoordinatFilter = 'all' | 'invalid' | 'valid' | 'no_coords'

export type PenerimaFotoGroup = {
    penerima_id: number
    penerima_nama: string
    penerima_nik: string
    komponen_id: number
    komponen_nama: string
    unit_index?: number
    /** Foto terikat komponen yang sudah tidak ada di daftar output pekerjaan */
    isOrphanKomponen?: boolean
    fotos: Record<FotoProgressLevel, Foto[]>
}

/**
 * Samakan slot progress (dukung legacy "50%|Unit 2") agar edit tidak
 * "menghilangkan" foto dari matriks.
 */
export function normalizeFotoProgress(value?: string | null): string {
    if (!value) return '0%'
    const base = (String(value).split('|')[0] ?? '').trim()
    if ((FOTO_PROGRESS_LEVELS as readonly string[]).includes(base)) return base
    if ((FOTO_PROGRESS_LEVELS as readonly string[]).includes(`${base}%`)) return `${base}%`
    return base || '0%'
}

export function emptyFotoProgressBuckets(): Record<FotoProgressLevel, Foto[]> {
    return {
        '0%': [],
        '25%': [],
        '50%': [],
        '75%': [],
        '100%': [],
    }
}
